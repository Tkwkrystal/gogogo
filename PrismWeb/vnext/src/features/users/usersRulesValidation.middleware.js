var env_config = require('config');
var objectID = require('mongodb').ObjectID;
var _ = require('underscore');
var Q = require('q');

var authentication = require('../../common/middlewares/authentication.middleware');
var userMongo = require('./users.dal');
var widgetMongo = require('../widgets/widgets.dal');
var crypto =  require('../../common/security/crypto');
var applicationError = require('../../common/errors/ApplicationErrors');
var server = require('../../common/server');
var licenseService = require('../../common/services/license.service');
var userService = require('./users.service');
var roleReadService = require('../roles/roleRead.service');
var license =  require('../../common/services/oxygenLicense.service');
var stringUtils = require('../../common/utils/string.util');
var groupService = require('../groups/groups.service');
var settingsSecurityService = require('../settings/settings.security.service');
var hashService = require('../../common/security/hash');

var DO_PROMISE = true;
var DEFAULT_PASSWORD_REGEX = new RegExp(
    '^(?=.*\\d)(?=.*[a-zA-z])(?=.*[~!@#$%^&*_\\-+={}\\[\\]()<>`\'".,:;\\/|])[0-9a-zA-Z~!@#$%^&*_\\-+={}\\[\\]()<>`\'".,:;\\/|]{8,255}$'
);

var DEFAULT_PASSWORD_ERROR = 'A password must have at least 8 characters and use one of each of the following:' +
                                ' letter, number, and special character. You may not reuse the previously used password.'

function userRolesValidation (){

    this.getUsers = function (req, res, next) {
        return next();
    }

    // not in use now because it's the same as add user validation
    this.inviteUser = function (req, res, next) {
    };

    this.activateUser = function (req, res, next) {
        var updateUser = req.body;
        var user = req.params.user;

        userMongo.findByIdUsername(user,function(err,userItem){
            //check for database error
            if(err) return server.error(res, new applicationError.Database(err));
            if(!userItem)return server.error(res, new applicationError.NotFound('user not found'));

            // We decided that user which the admin already set a password
            // for him can use this activate mail to change the password
            // See pris - 8512
            //if(userItem.active)  return server.error(res, new applicationError.badRequest('The user has already been activated'));
            if(!userItem.pendingExpiration)  return server.error(res, new applicationError.badRequest('user activation has expired'));
            if(dateExpires(userItem.pendingExpiration))  return server.error(res, new applicationError.badRequest('user activation has expired'));
            return next();
        });
    };

    this.recoverPassword = function (req, res, next) {
        var updateUser = req.body;
        var user = req.params.user;

        userMongo.findByIdUsername(user, function(err,userItem) {
            //check for database error
            if(err) return server.error(res, new applicationError.Database(err));
            if(!userItem)return server.error(res, new applicationError.NotFound('user not found'));

            if(!userItem.changePasswordState)  return server.error(res, new applicationError.badRequest('The user has already been activated'));
            if(!userItem.pendingExpiration)  return server.error(res, new applicationError.badRequest('user activation has expired'));
            if(dateExpires(userItem.pendingExpiration))  return server.error(res, new applicationError.badRequest('user activation has expired'));
            return next();
        });
    }

    function dateExpires(date) {
        var a = new Date();
        var b = Date.parse(date);

        // difference in milliseconds
        var d = (b - a);
        return d < 0;
    }

    this.count = function (req, res, next) {

        return next();
    };

    this.findById = function (req, res, next) {

        return next();
    };

    function verifyRolesAccordingToLicense(rolesCount) {
        return licenseService.getLeftLicenses()
            .then(function (leftLicenses) {
                var error;

                if (rolesCount.admin > leftLicenses.admins) {
                    error = "Your license is limited to " + leftLicenses.admins + " more Admins";
                }
                else if (rolesCount.consumer > leftLicenses.consumers) {

                    error = "Your license is limited to " + leftLicenses.consumers + " more viewers";
                }
                else if (rolesCount.contributor > leftLicenses.contributors) {

                    error = "Your license is limited to " + leftLicenses.contributors + " more designers";
                }
                if (error){
                    throw (new applicationError.badRequest(error));
                }
                return;
            });
    }

    function addEmailFilterToQuery(value) {
        var queryArray = [];

        queryArray.push({'userName': { "$regex" : '^' + stringUtils.escapeRegExp(value) + '$', "$options" : "i" }});
        queryArray.push({'email': { "$regex" : '^' + stringUtils.escapeRegExp(value) + '$', "$options" : "i" }});

        return queryArray;
    }

    function addUsernameFilterToQuery(value) {
        var queryArray = [];

        queryArray.push({'email': { "$regex" : '^' + stringUtils.escapeRegExp(value) + '$', "$options" : "i" }});
        queryArray.push({'userName': { "$regex" : '^' + stringUtils.escapeRegExp(value) + '$', "$options" : "i" },
                         $or: [{activeDirectory : {$exists: false}}, {activeDirectory: false}]});

        return queryArray;
    }

    function createUsernameAndEmailFilteredQuery(userItem) {

        var queryArray = [];

        if (userItem.email) {
            queryArray = queryArray.concat(addEmailFilterToQuery(userItem.email));
        }

        if (userItem.mail) {
            queryArray = queryArray.concat(addEmailFilterToQuery(userItem.mail));
        }

        if (userItem.userName) {
            queryArray = queryArray.concat(addUsernameFilterToQuery(userItem.userName));
        }

        return queryArray;
    }

    this.addUser = function (isAd, req, res, next) {
        var newUsers = req.body;
        var queryArray = [];
        var rolesCount = {admin : 0, consumer : 0, contributor : 0};

        var options = {
            includeBaseRolesName : true,
            compiledRoles : true
        }
        var allCompiledRoles;
        return roleReadService.getAllRoles(options)
        .then(function (roles){
            allCompiledRoles = roles;
            newUsers.forEach(function(userItem){
                if(userItem.roleId)
                {
                    var compiledRole = _.filter(allCompiledRoles, function (role){
                        return (role.name === userItem.roleId ||
                                role._id.toString() === userItem.roleId.toString())
                    });
                    if (!compiledRole || _.isEmpty(compiledRole)){
                        throw (new applicationError.badRequest('role '+ userItem.roleId + ' does not exists'));
                    }
                    var baseRoleName = compiledRole[0].baseRoleName;
                    if (baseRoleName === "super"){
                        throw (new applicationError.badRequest('You cannot add a user with sys admin role'));
                    }
                    rolesCount[baseRoleName] += 1;
                } else {
                    rolesCount.consumer++;
                }

                if (!isAd) {
                    queryArray = queryArray.concat(createUsernameAndEmailFilteredQuery(userItem));
                }
            });

            if (!isAd) {
                var query = {$or: queryArray};

                return userService.findByQuery(null, null, query);
            } else {
                return [];
            }
        }).then(function (users){
            if(!_.isEmpty(users)){
                throw (new applicationError.badRequest('User name or email already exists'));
            }
            return verifyRolesAccordingToLicense(rolesCount);
        }).then(function (){
            return verifyUsersGroups(newUsers);
        }).then(function (){
            return verifyPasswordPolicy(newUsers);
        }).then(function (){
            return next();
        }).catch(function (err){
            if (err instanceof applicationError.badRequest){
                return res.send({
                    "status": "error",
                    "message": err.message
                });
            }
            return server.error(res, new applicationError.Database(err));
        });
    };

    function updateUserVerifyRoles(userItem, newUser){
        var newUserBaseRoleName;

        return Q.when()
        .then(function(){
            // case trying to update super user roles -> error
            if (userItem.baseRoleName === "super" && newUser.roleId) {
                throw (new applicationError.badRequest('You cannot update the sys admin user\'s role'));
            }

            if (!newUser.roleId){
                return;
            }

            return roleReadService.getRoleByIdOrName(newUser.roleId, undefined, true)
            .then(function(compiledRole){
                newUserBaseRoleName = compiledRole.baseRoleName;

                // case trying to update user to super -> error
                if (newUserBaseRoleName === "super") {
                    throw (new applicationError.badRequest('You cannot update user to sys admin role'));
                }

                // If there is problematic user without role id we
                // consider him as a consumer, so if we change it to consumer
                // again we don't need to validate the licenses again
                if (!userItem.roleId && newUserBaseRoleName === "consumer"){
                    return;
                }

                if (userItem.roleId && userItem.roleId.toString() === compiledRole._id.toString()){
                    return;
                }
                var rolesCount = {
                    admin : 0,
                    contributor : 0,
                    consumer : 0
                };
                rolesCount[newUserBaseRoleName] = 1;

                return verifyRolesAccordingToLicense(rolesCount);
            });
        });


    }

    function updateUserVerifyUserNameEmail(userItem, newUser){
        if (!newUser.email && !newUser.userName) {
            return Q.when();
        }

        var queryArray = createUsernameAndEmailFilteredQuery(newUser);

        var query = {$and: [{$or: queryArray}, {'_id': {$ne: userItem._id}}]};

        return userService.findByQuery(null, null, query)
        .then(function (users){
            if(!_.isEmpty(users)){
                throw (new applicationError.badRequest('User name or email already exists'));
            }
            return;
        });
    }

    this.updateUser = function (req, res, next) {
        var newUser = req.body;
        var userIdName = req.params.user;
        var userItem;

        return userService.findByIdUsername(userIdName, null, DO_PROMISE)
        .then(function(user){
            userItem = user;
            return updateUserVerifyRoles(userItem, newUser)
        }).then(function(){
            return updateUserVerifyUserNameEmail(userItem, newUser);
        }).then(function(){
            return verifyUsersGroups(newUser);
        }).then(function(){
            return verifySysAdmin(userItem, newUser, req.authentication.userObj);
        }).then(function (){
            return verifyPasswordPolicy(newUser, userItem);
        }).then(function(){
            return next();
        }).catch(function(err){
            if (err === "roleNotExist"){
                return server.sendAsErr(res, err);
            }
            if (err instanceof applicationError.badRequest){
                return res.send({
                    "status": "error",
                    "message": err.message
                });
            }
            return server.error(res, new applicationError.Database(err));
        });
    };

    this.deleteUser = function (req, res, next) {
        var user = req.params.user;

        return userService.findByIdUsername(user, null, DO_PROMISE)
        .then(function (user) {

            if (user.baseRoleName === "super"){
                // cannot delete super user
                throw (new applicationError.badRequest("cannot delete super user"));
            }

            return next();
        }).catch(function(err){
            if (err instanceof applicationError.badRequest){
                return server.error(res, err);
            }
            return server.error(res, new applicationError.Database(err));
        });
    };

    this.deleteUsers = function (req, res, next) {
        var userIds = req.body;
        userIds = _.map(userIds, function(x){ return new objectID(x); });
        var query = {_id: {$in: userIds}};

        return userService.findByQuery(null, null, query, null )
        .then(function (users) {
            var isIncludeSuperUser = _.filter(users, function(user){
                return user.baseRoleName === "super";
            }).length > 0;
            if (isIncludeSuperUser){
                throw(new applicationError.badRequest("cannot delete super user"));
            }

            return next();
        }).catch(function(err){
            if (err instanceof applicationError.badRequest){
                return server.error(res, err);
            }
            return server.error(res, new applicationError.Database(err));
        });
    };

    function verifyUsersGroups(users) {
        var _users = Array.isArray(users) ? users : [users];

        return Q.all(_users.map(function (user) {
            return groupService.findGroupsByArray(user.groups, false, false, null, true).then(function (groups) {
                if (groupService.isAdminsOrEveryoneGroups(groups)) {
                    throw (new applicationError.badRequest('user cannot be added to admins or everyone group'));
                }
            });
        }));
    }

    function verifySysAdmin(origUser, updatedUser, authenticatedUser) {
        // case trying to update super user password -> error
        if ((origUser.baseRoleName === 'super') && authenticatedUser.baseRoleName !== 'super') {
            throw (new applicationError.badRequest('You cannot update the sys admin user\'s details'));
        }
    }

    function verifyPasswordPolicy(usersToCheck, updateUserExistingUser) {
        var _users = Array.isArray(usersToCheck) ? usersToCheck : [usersToCheck];
        var usersWithPasswords = _users.filter(function (user) {
            return user.hasOwnProperty('password');
        });

        if (_.isEmpty(usersWithPasswords)) return;

        return settingsSecurityService.get(null, DO_PROMISE).then(function (securitySettings) {
            var passwordError = securitySettings.passwordError || DEFAULT_PASSWORD_ERROR;

            var passwordRegex = securitySettings.passwordRegex ? new RegExp(securitySettings.passwordRegex) : DEFAULT_PASSWORD_REGEX;

            if (!usersWithPasswords.every(function (user) { return (user.password && passwordRegex.test(user.password));})) {
                return Q.reject(new applicationError.badRequest(passwordError));
            } else {
                if(updateUserExistingUser && updateUserExistingUser.hash) {
                    return hashService.validate(updateUserExistingUser.hash,usersWithPasswords[0].password, updateUserExistingUser.encryptionSHA).then(function (passwordsEquals) {
                        if(passwordsEquals) {
                            throw (new applicationError.badRequest(passwordError));
                        } else {
                            return true;
                        }
                    }).catch(function () {
                        throw (new applicationError.badRequest(passwordError));
                    });
                } else {
                    return Q.when(true);
                }
            }
        });
    }
}


userRolesValidation.instance = null;

userRolesValidation.getInstance = function(){
    if(this.instance === null){
        this.instance = new userRolesValidation();
    }
    return this.instance;
}


module.exports = userRolesValidation.getInstance();
