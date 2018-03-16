
var env_config = require('config'),
    _ = require('lodash'),
    Q                    = require('q'),
    uuid = require('node-uuid'),
    passport = require('passport'),
    saml = require('passport-saml'),
    server               = require('../server'),
    configMongo          = require('../dal/appConfigMongo'),
    permissionsErrors    = require('../errors/permissions.errors'),
    userService          = require('../../features/users/users.service'),
    groupService          = require('../../features/groups/v1/groups.service'),
    roleReadService      = require('../../features/roles/roleRead.service'),
	authenticationService = require('../../features/authentication/v1/authentication.service'),
	securityUtils		= require('../../common/security/securityUtils');
var logger  = require('../logger').default('baseMongo');
var SAML_SSO = 'saml';

let samlOptions = {
    path: '/api/v1/authentication/login_saml_callback/',
    entryPoint: 'entryPointPlaceholder',
    issuer: 'Sisense',
    identifierFormat: 'urn:oasis:names:tc:SAML:2.0:nameid-format:emailAddress',
    cert: 'certificatePlaceholder',
    acceptedClockSkewMs: 5000 // PRIS-21611: Time in milliseconds of skew that is acceptable between client and server
};

module.exports = {
    validateSamlAuthenticationResponse: validateSamlAuthenticationResponse
};

var samlStrategy = new saml.Strategy(samlOptions, function(profile, done) {

    return findOrCreateUser(profile)
        .then(function (user) {
            return done(null, user);
        })
        .catch(function(err) {
            return done(err);
        });
});

passport.use(samlStrategy);

/* ----------------------PUBLIC FUNCTIONS-----------------------*/

function validateSamlAuthenticationResponse(req, res, next) {
    return configMongo.findOne({ name : 'sso' }, null, true)
        .then(function (config) {
            if (config && config.enabled && config.ssoType.toLowerCase() === SAML_SSO && config.loginUrlSaml) {
                samlOptions.cert = config.idPCert;
                samlOptions.entryPoint = config.loginUrlSaml;
                return authenticateUserWithSamlData(req, res, next);
            }

            logger.error('SAML authentication not configured, but SAML request callback was called!');
            var error = new permissionsErrors.AccessDenied(null);
            return server.sendError(req, res, error);
        });
}
/* -----------------END OF PUBLIC FUNCTIONS---------------------*/

/* ----------------------PRIVATE FUNCTIONS----------------------*/

function getSamlUserGroups(memberOf) {
    memberOf = _.isString(memberOf) ? [memberOf] : memberOf;

    var promises = [];

    for (var i = 0; i < memberOf.length; i++) {
        promises.push(groupService.getGroups({ name: memberOf[i] }));
    }

    return Q.all(promises)
        .then(function (groups) {
            return _.flatten(groups);
        });
}

function determineUsersRole(groups) {
    var possibleRoles = _.map(groups, function(group) {
        return group.defaultRole;
    });
    possibleRoles.push('consumer'); // add default role - viewer

    possibleRoles = _.compact(possibleRoles);

    var defaultRole = _.maxBy(possibleRoles, function(role) {
        switch (role) {
        case 'consumer':
            return 0;
        case 'contributor':
            return 1;
        }
    });

    return roleReadService
        .getRoleByIdOrName(defaultRole, undefined, false);
}

function addUserToSamlGroups(userId, groups) {
    var groupIds = _.map(groups, function(group) {
        return group._id.toHexString();
    });

    var promises = [];

    for (var i = 0; i < groupIds.length; i++) {
        promises.push(userService.addGroup(userId, groupIds[i], undefined, true));
    }

    return Q.all(promises);
}


function findOrCreateUser(profile) {
    var userEmail = profile['User.email'] || profile.nameID;

    return userService.findByEmail(userEmail, null, true)
        .then(function (user) {

            if (!user){
                // create new user
                var newUser = {
                    email: userEmail,
                    firstName: profile['User.FirstName'],
                    lastName: profile['User.LastName'],
                    createdSso: SAML_SSO,
                    sso: true
                };

                return getSamlUserGroups(profile.memberOf || [])
                    .then(function(groups) {
                        return determineUsersRole(groups)
                            .then(function (role) {
                                newUser.roleId = role._id.toJSON();
                                return userService.addUser(newUser, {}, undefined, true);
                            })
                            .then(function(createdUsersArray) {
                                var createdUser = createdUsersArray[0];

                                return addUserToSamlGroups(createdUser._id.toHexString(), groups)
                                    .then(function() {
                                        return createdUser;
                                    });
                            });
                    });
            }

            return user;
        });
}

function authenticateUserWithSamlData(req, res, next) {
    const deferred = Q.defer();

    req.query.RelayState = req.query.address;

    Object.defineProperty(req, "protocol", { value: req.url.indexOf("https") !== -1 ? "https" : "http"}); // Express doesn't recognize https protocol, thus we should change it manually

    passport.authenticate(SAML_SSO, function(err, user) {
        if (err || !user) {
            logger.error('SAML authentication with incorrect credentials', err);
            return res.redirect('/spotway/#/access/signin');
        }

        var requestDeviceId = uuid.v1();

        return authenticationService.getAuthObj(user, requestDeviceId)
            .then(function (authObj) {

                req.authentication = authObj;

                return authenticationService.generateAuthenticationCookieTicket(authObj.userObj, requestDeviceId);
            }).then(function (cookie) {
				return securityUtils.isSecureCookie().then(function (isSecureCookie) {
					res.cookie(env_config.cookie.name, cookie, { httpOnly: true, secure: isSecureCookie });
					res.redirect(req.body.RelayState || '/');
				});
            }).catch(function (err) {
                logger.error('SAML authentication error: ', err);
                res.clearCookie(env_config.cookie.name);
                return res.redirect('/spotway/#/access/signin');
            });
    })(req, res, next);

    return deferred.promise;
}
/* -----------------END OF PRIVATE FUNCTIONS--------------------*/
