/**
 * Created with JetBrains WebStorm.
 * User: a.elkayam
 * Date: 24/09/13
 * Time: 17:16
 * To change this template use File | Settings | File Templates.
 */


/*
 * widget controller which responsible
 * for all widget operation
 */

module.exports = new authController();

var env_config = require('config');


var root = process.cwd();
var applicationError = require('../../common/errors/ApplicationErrors');
var server = require('../../common/server');
var userMongo = require('../users/users.dal');
var configMongo = require('../../common/dal/appConfigMongo');
var hashService = require('../../common/security/hash');
var crypto = require('../../common/security/crypto');
var userFactory = require('../users/users.factory');
var serverEnvironment = require('../../common/serverEnvironment');
var license =  require('../../common/services/oxygenLicense.service');
var sessionCrypto = require('crypto');
var sessionInfo = require('../../common/security/session');

var tokensGrant = require('../../common/session/grant');
var cryptor = require('../../common/session/crypto');
var application =  require('../../common/application');
var ldapService = require('../ldap/ldap.service');
var ldapDomainsService = require('../ldapDomains/v1/ldapDomains.service');
var groupService = require('../groups/groups.service');
var userService = require('../users/users.service');
var userService2 = require('../users/v1/users.service');
var licenseService = require('../../common/services/license.service');
var securityUtils = require('../../common/security/securityUtils');
var DO_PROMISE = true;
var _ = require('underscore');
var Q = require('q');
var authenticationService = require('./v1/authentication.service');
var saml = require('passport-saml');

const logger = require('../../common/logger').default('authentication-controller');

function authController()  {

    this.getPasswordPhrase = function(req, res,next){

        var self = this;

        tokensGrant.generatPasswordToken(function (code) {

            res.json({

                secret:code

            });

            cryptor.init(code);

        },function(error){


        });
    };

    this.refreshPasswordPhrase    = function(req, res,next){
        //generate random passphrase binary data
        var r_pass = sessionCrypto.randomBytes(128);
        //convert passphrase to base64 format
        var r_pass_base64 = r_pass.toString("base64");

        res.json({

            secret:r_pass_base64

        });

        sessionInfo.setLoginSecret(r_pass_base64);

        return next()
    };

    this.signUp = function(req, res,next) {
        var password =  req.body.password;
        var userName =  req.body.username;
        var preferences = {
          "localeId": req.body.localeId
        };

        return hashService.create(password).then(function (newHash) {
            var userObject = {"userName": userName,"hash": hash.toString(), "preferences": preferences};

            return userFactory.create(userObject)
                .then(function (userObject){
                    userMongo.add(userObject, function(err, result){
                        if (err) return server.error(res, new applicationError.Database(err));
                        if(!result[0])  return server.error(res, new applicationError.Database(err));

                        req.validatedUser  =  result[0];
                        return next();
                    });
                });
        });
    };
    function getHighestRoleObject(groups){
        var rolesArr = _.pluck(groups, "baseRoleName");
        if (_.indexOf(rolesArr, "admin") > -1){
            return "admin";
        }
        if (_.indexOf(rolesArr, "contributor") > -1){
            return "contributor";
        }

        return "consumer";
    }

    function addUserPreferences(user, pref) {
        if (user.preferences) {
            user.preferences.localeId = pref.localeId;
        }
        else {
            // Add the localeId as part of user preferences
            user.preferences = {
                localeId: pref.localeId
            };
        }
    }

    function doLogin(req) {
        var deferred = Q.defer();
        var self = this;

        var userName = req.body.username,
            password = req.body.password,
            localeId = req.body.localeId;

        var preferences = {
            localeId: localeId
        };

        userService2.getUserByLoginName(userName)
            .then(function(userItems){
				let userItem;

				if (userItems.length > 1) {
					userItem = 	userItems.find(user => (user.email && (userName.toLowerCase() === user.email.toLowerCase()))) ||
								userItems.find(user => !user.activeDirectory);

					if (!userItem) return deferred.reject(new applicationError.UserCredentials('wrong username or password'));
				} else {
					userItem = userItems[0];
				}

                if (!userItem) {
                    ldapDomainsService.getLdapDomains({enabled: true}, undefined, undefined, {includeDecryptedPassword: true})
                        .then(function (ldapDomains) {
                            var _username;
                            var userLdapDomain;
                            var domainId;
                            var parsedUser = userService2.parseStringUserToUsernameAndDomain(userName);

                            if (parsedUser.domain) {
                                var correspondingDomain = ldapDomains.find(function (domain) {
                                    return domain.name.toLowerCase() === parsedUser.domain.toLowerCase();
                                });

                                if (correspondingDomain) {
                                    userLdapDomain = ldapDomainsService.createLdapDomainObject(correspondingDomain);
                                    _username = parsedUser.username;
                                    domainId = correspondingDomain._id;
                                }
                            } else {
                                if (ldapDomains.length === 1) {
                                    userLdapDomain = ldapDomainsService.createLdapDomainObject(ldapDomains[0]);
                                    _username = userName;
                                    domainId = ldapDomains[0]._id;
                                }
                            }

                            if (userLdapDomain) {
                                var userGroups = [];
                                var userToAdd = {};

                                // Search the user in AD
                                ldapService.findUser(_username, userLdapDomain, null, DO_PROMISE)
                                    .then(function (ADuser){
                                        if (!ADuser){
                                            throw (new applicationError.UserCredentials("user not found on Active Directory"));
                                        } else {
                                            userToAdd = ADuser;
                                            userToAdd.domain = { _id: domainId};

                                            // Check if user with the same email/username already
                                            // exist
                                            return userService.isUsersExist([userToAdd]);
                                        }
                                    }).then(function(users){
                                        if (users[0].isExist){
                                            throw (new applicationError.General("username/email already exists"));
                                        } else {
                                            //Try to authenticate with AD
                                            return ldapService.authenticate(userToAdd.userPrincipalName, password, userLdapDomain, null, DO_PROMISE);
                                        }
                                    }).then(function(auth){
                                        if (!auth){
                                            throw (new applicationError.UserCredentials("wrong username or password"));
                                        } else {
                                            // Check which groups of the user's groups is in the system
                                            userGroups = _.pluck(userToAdd.adgroups, "objectSid");
                                            var options = {
                                                objectSid: userGroups,
                                                onlyAD: true,
                                                exactMatch: true
                                            };
                                            return groupService.findGroups(options, null, DO_PROMISE);
                                        }
                                    }).then(function (groups){
                                        // Check if user have internal ad groups
                                        if (groups.length < 1){
                                            throw (new applicationError.UserCredentials("user doesn't have valid groups"));
                                        }
                                        else {
                                            // Get the highest role
                                            userToAdd.roleId = getHighestRoleObject(groups);
                                        }

                                        // get left licensing
                                        return licenseService.getLeftLicenses();
                                    }).then(function (leftLicenses){
                                        var role = userToAdd.roleId;

                                        // Check licensing
                                        if (role === "admin" && leftLicenses.admins < 1){
                                            role = "contributor";
                                        }

                                        if (role === "contributor" && leftLicenses.contributors < 1){
                                            role = "consumer";
                                        }

                                        if (role === "consumer" && leftLicenses.consumers < 1){
                                            throw (new applicationError.License("No Consumer licenses available"));
                                        }

                                        userToAdd.roleId = role;

                                        userToAdd.ldapDomainId = domainId;

                                        addUserPreferences(userToAdd, preferences);

                                        // Add the user to the system
                                        return userService.addAdUser([userToAdd], null,false, null, DO_PROMISE);
                                    }).then(function (result){

                                        if (result.addedUsers.length > 1){
                                            throw (new applicationError.General("could not find the user id"));
                                        }

                                        //get the id
                                        userId = result.addedUsers[0]._id;
                                        if (!userId){
                                            throw (new applicationError.General("could not find the user id"));
                                        }

                                        deferred.resolve(userId);
                                    })
                                    .catch(function(err){
                                        deferred.reject(err);
                                    });
                            } else {
                                deferred.reject(new applicationError.UserCredentials('wrong username or password'));
                            }
                        });
                }
                ///case for active directory authentication
                else if (userItem.activeDirectory)
                {
                    var ldapDomainObject;

                    ldapDomainsService.getLdapDomain(userItem.ldapDomainId, undefined, undefined, {includeDecryptedPassword: true})
                        .then(function (ldapDomain) {
                            if (!ldapDomain) {
                                deferred.reject(new applicationError.LdapDomainNotFoundError());
                            }

                            if (!ldapDomain.enabled) {
                                deferred.reject(new applicationError.LdapDisabled("ActiveDirectory is disabled"));
                            }

                            ldapDomainObject = ldapDomainsService.createLdapDomainObject(ldapDomain);

                            var userToUpdate;

                            //Try to authenticate with AD
                            ldapService.authenticate(userItem.principalName, password, ldapDomainObject, null, DO_PROMISE)
                                .then(function(auth){
                                    if (!auth){
                                        throw (new applicationError.UserCredentials("wrong username or password"));
                                    }
                                    // Get the user
                                    return ldapService.findUser(userItem.principalName, ldapDomainObject, null, DO_PROMISE);
                                }).then(function (ADuser){

                                    userToUpdate = ADuser;
                                    userToUpdate.lastLogin = new Date();

                                    addUserPreferences(userToUpdate, preferences);

                                    // We don't want to update user groups in login, only at
                                    // sync. because if we changed the group dn the user will
                                    // lose his connection to the group because the group it
                                    // self didn't update yet.
                                    //delete userToUpdate.adgroups;


                                    // Update user details in mongo
                                    return userService.updateUser(userItem._id.toString(), userToUpdate, null, DO_PROMISE);
                                }).then(function (result){
                                    deferred.resolve(userItem._id);
                                }).fail(function(err){
                                    deferred.reject(err);
                                });
                        });
                }
                else if (userItem)
                {
                    var userToUpdate = userItem;

                    //check if password correct
                    hashService.validate(userItem.hash,password, userItem.encryptionSHA).then(function (validate) {
                        if(!validate) {
                            deferred.reject(new applicationError.UserCredentials('wrong username or password'));
                        } else {
                            userToUpdate.lastLogin = new Date();

                            addUserPreferences(userToUpdate, preferences);

                            return userService.updateUser(userItem._id.toString(), userToUpdate, null, DO_PROMISE).then(function () {
                                deferred.resolve(userItem._id);
                            });
                        }
                    });
                }
            }).catch(function (err){
                deferred.reject(new applicationError.Database(err));
            });

        return deferred.promise;
    }

    this.tryLogin = function(req,res){
        var loginPromise = doLogin(req);

        loginPromise.then(function(result) {
            return res.send(result);
        }).fail(function(err) {
            return server.error(res, err);
        });
    };
    this.wxLogin=function(req,res){

        license.getLicense().then(function(licenseInfo) {
            var userName = null,
                isPersistent = false,
                localeId = "zh-CN",
                key = licenseInfo.machine;
            var token = req.params.token;
            // res.send(key);
            if (token != null) {
                tokensGrant.verifyWXToken(token, key, {}, function (err, decoded) {
                    if (err) {
                        return res.send({"error": err});
                    } else {
                        //decoded.sub
                        //decoded.iat
                        //TODO:ʱ����
                        userName = decoded.sub;
                    }
                });
            } else {
                return res.send({"token": err});
            }
            res.send(userName);

        });
    }

    this.login = function(req,res) {
        var loginPromise = doLogin(req);

        loginPromise.then(function(result) {
            userService.findById(result.id, null, true)
                .then(function(userItem){
                    var isPersistent = (req.body.isPersistent && req.body.isPersistent != 'null') ? req.body.isPersistent : false;

                    // If security config has sessionOnlyCookie: true
                    if (application.security.sessionOnlyCookie) {
                        isPersistent = false;
                    }

                    addOldCookie(res,isPersistent,userItem).then(function () {
						var urlSrc = (req.body.src && req.body.src != 'null') ? serverEnvironment.convertToRelativeUrl(req.body.src, req) : serverEnvironment.getAppHomeUrl(req);
						return res.redirect(urlSrc);
					});
                });
        }).fail(function(err) {
            return server.error(res, err);
        });
    };
/*
    this.validateUserPassword = function(req,res) {
        // console.log(req);


        var userName = req.body.username;
        var password = req.body.password;
        var isPersistent =  req.body.isPersistent;

        var urlSrc = serverEnvironment.getAppHomeUrl(req);
        urlSrc = req.query["src"]? req.query["src"]:serverEnvironment.getAppHomeUrl(req);
        if(urlSrc === null||urlSrc === 'null') urlSrc = serverEnvironment.getAppHomeUrl(req);


        var query = {$or:[{'userName': { "$regex" : '^' +userName + '$', "$options" : "-i" }},{'email': { "$regex" : '^' +userName + '$', "$options" : "-i" }}],active:true};
        userMongo.getUserByQuery(query, function(err,userItem){
            if (err) return server.error(res, new applicationError.Database(err));
            if(!userItem)  return server.error(res, new applicationError.UserCredentials('user or password not match'));

            if(userItem.activeDirectory)
            {
                activeDirectoryController.ad.authenticate(userName+"@"+activeDirectoryController.adServer,password,function(err,auth){
                    if(err || !auth) return server.error(res, new applicationError.UserCredentials('user or password not match'));

                    var strCookieTicketEncrypted =  getCookie(userItem._id,isPersistent) ;
                    if(isPersistent) res.cookie(env_config.cookie.name, strCookieTicketEncrypted,{ maxAge: 900000, httpOnly: true });
                    else  res.cookie(env_config.cookie.name, strCookieTicketEncrypted);

                    return res.send({"id": userItem._id,"src":urlSrc});

                })
            }
            else
            {
                //check if password correct
                if (!md5.validate(userItem.hash,password)) return server.error(res, new applicationError.UserCredentials('user or password not match'));

                var strCookieTicketEncrypted =  getCookie(userItem._id,isPersistent) ;
                if(isPersistent) res.cookie(env_config.cookie.name, strCookieTicketEncrypted,{ maxAge: 900000, httpOnly: true });
                else  res.cookie(env_config.cookie.name, strCookieTicketEncrypted);

                return res.send({"id": userItem._id,"src":urlSrc});
            }
        });
    }
*/
    this.cookieGeneration = function (req, res) {
        var urlSrc = serverEnvironment.getAppHomeUrl(req);
        var urlSrc = req.query["src"]? req.query["src"]:serverEnvironment.getAppHomeUrl(req);
        if(urlSrc === null) urlSrc = serverEnvironment.getAppHomeUrl(req);

		var strCookieTicketEncrypted =  getCookie(req.validatedUser._id,req.body.isPersistent) ;

		securityUtils.isSecureCookie().then(function (isSecureCookie) {
			if(req.body.isPersistent)
			{
				var userAgent = res.req.headers['user-agent'];
				res.cookie(env_config.cookie.name, strCookieTicketEncrypted,{ maxAge: securityUtils.getCookieMaxAge(userAgent), httpOnly: true });
			}
			else
			{
				res.cookie(env_config.cookie.name, strCookieTicketEncrypted);
			}


			//if iis mode or debug mode for test env
			if (process.env.PORT)
			{
				res.redirect(urlSrc);
			}
			else
			{
				res.send({"id": req.validatedUser._id});
			}
		});
    };

    function generateDeviceId() {
        return securityUtils.generateSecret();
    }

    function addCookie(res, isPersistent, cookie){

        var cookiePersistentExp = 365 * 24 * 60 * 60,//1 year in seconds
            securitySettings = null;

        if(application && (securitySettings = application.security)){
            cookiePersistentExp =  securitySettings.cookieExp? securitySettings.cookieExp * 24 * 60 * 60 :cookiePersistentExp;//in days
        }

        return attachCookie(res, isPersistent, cookie);
    }

    function addOldCookie(res, isPersistent, userItem){

        var cookiePersistentExp = 365 * 24 * 60 * 60,//1 year in seconds
            securitySettings = null;

        if(application && (securitySettings = application.security)){
            cookiePersistentExp =  securitySettings.cookieExp? securitySettings.cookieExp * 24 * 60 * 60 :cookiePersistentExp;//in days
		}

        ///.net backward support
        var ticket =  getCookieTicket(userItem._id,isPersistent);

        return attachCookie(res, isPersistent, ticket);
    }

    function attachCookie(res, isPersistent, ticket) {
		return securityUtils.isSecureCookie().then(function (isSecureCookie) {
			if(isPersistent){
				//    var exp = new Date(today.getTime() +(30 * 24 * 60 * 60 * 1000));
				var userAgent = res.req.headers['user-agent'];
				res.cookie(env_config.cookie.name, ticket, {maxAge:securityUtils.getCookieMaxAge(userAgent),httpOnly: true, secure: isSecureCookie });
			}
			else {
				res.cookie(env_config.cookie.name, ticket, { httpOnly: true, secure: isSecureCookie });
			}
		});
    }

    this.getCookie= function(userId,isPersistent) {
        return getCookie(userId,isPersistent);
    }

    function getCookieTicket(userId,isPersistent){
        return securityUtils.getCookieTicket(userId, isPersistent);
    }

    function getCookie(userId,isPersistent){
        return securityUtils.getCookieTicket(userId, isPersistent);
    }

    this.isUserExist = function (req, res, next) {
        var userName = req.body.username;
        var query = {'userName': userName};

        userMongo.getUserByQuery(query,  function(err,userItem) {
            if (err) return server.error(res, new applicationError.Database(err));
            if(userItem)  return server.error(res, new applicationError.UserCredentials('User already exist'));

            next();
        });
    };

    this.startup = function(req,res){
        license.getLicense()
            .then(function(licenseInfo){

                if(licenseInfo && licenseInfo.user && licenseInfo.user.email) {
                    var query = {'email': req.params.email};

                    userService.findByQuery(null, null, query, {})
                        .then(function(userItems) {
                            var userItem = _.find(userItems, function(u) { return u.email === req.params.email });

                            if (!userItem) {
                                throw "user " + req.params.email + " does not exist";
                            }

                            if((req.params.email !== licenseInfo.user.email) || !userItem || (userItem.baseRoleName !== 'super')){
                                return res.redirect("/");
                            }

                            var deviceId = generateDeviceId();

                            return authenticationService.generateAuthenticationCookieTicket(userItem, deviceId)
                                .then(function (cookie) {
                                    return addCookie(res, false, cookie).then(function () {
                                    	return res.redirect("/");
									});
                                });
                        })
                        .catch(function (err) {
                            logger.error(err);
                            return res.redirect("/");
                        });

                } else {
                    return res.redirect("/");
                }
            });
    };

    this.logout = function(req,res) {
        var user = req.authentication.userObj;
        if (!req.cookies[env_config.jwtCookie.name]) {
            var deviceId = req.authentication.deviceId;
            defaultLogout(req, res, user, deviceId);
        } else {
            ssoLogout(req, res, user);
        }
    };

    function checkIfSamlLogoutRequired(req, res, user) {
        // check if saml sso used
        return configMongo.findOne({"name" : "sso"}, function(err, config) {
            if (!err && config && config.enabled && !_.isUndefined(config.ssoType) &&
                config.ssoType.toLowerCase() === 'saml' && config.logoutUrlSaml) {
                // logout saml
                req.user = req.user || {};
                req.user.nameID = user.email;
                req.user.nameIDFormat = 'urn:oasis:names:tc:SAML:1.1:nameid-format:emailAddress';

                var samlStrategy = new saml.Strategy({
                    entryPoint: config.loginUrlSaml,
                    logoutUrl: config.logoutUrlSaml,
                    logoutCallbackUrl: '/api/v1/authentication/logout_saml_callback',
                    issuer: 'Sisense'
                }, function (profile, done) {
                    return done(null, profile);
                });
                return samlStrategy.logout(req, function (err, request) {
                    // redirect to the IdP with the encrypted SAML logout request

                    if (!err) {
                        // send url for saml identity provider logout
                        return server.send(res, request);
                    }

                    return server.ok(res);
                });

            }

            return server.ok(res);
        });
    }

    function defaultLogout(req, res, user, deviceId) {
        res.clearCookie(env_config.cookie.name);

        return authenticationService.revokeDeviceId(user, deviceId)
            .then(function () {
                return checkIfSamlLogoutRequired(req, res, user);
            });
    }

    function ssoLogout(req, res, user) {
        // SSO cookie found; clear the cookie and redirect to configured logout URL
        // TODO: find a way to clear the cookie even while redirecting to another domain
        res.clearCookie(env_config.jwtCookie.name);
        return authenticationService.revokeTokens('sso', [user._id.toHexString()])
            .then(function () {
                configMongo.findOne({"name" : "sso"}, function(err, config){
                    if (!err && config && config.enabled && config.ssoType.toLowerCase() === 'jwt' && config.logoutUrl) {
                        server.send(res,config.logoutUrl);
                    } else {
                        server.ok(res);
                    }
                });
            });
    }

    this.isAuthenticated = function(req,res){
        var  isAuthenticated = req.authentication&&req.authentication.isAuthenticated?true:false;
        var obj = { "isAuthenticated":isAuthenticated};
        if (isAuthenticated) return server.json(res,obj);

        // user is not authenticated; see if SSO is enabled and transmit info to client-side
        configMongo.findOne({"name": "sso"}, function (err, config) {
            if (err || !config || config.ssoType.toLowerCase() !== 'jwt') {
                logger.error('isAuthenticated: couldnt get SSO configuration', err);
                return server.json(res, obj);
            }

            obj.ssoEnabled = config.enabled;
            return server.json(res,obj);
            });
    };
}
