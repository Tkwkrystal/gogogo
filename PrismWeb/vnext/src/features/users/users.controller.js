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

var env_config = require('config');
var secret = env_config.super_user_api.secret;
var userService = require('./users.service');
var superUserService = require('./superUser.service');
var ldapService = require('../ldap/ldap.service');
var roleReadService = require('../roles/roleRead.service');
var authorisationService = require('../../common/services/authorization.service');
var serverEnvironment = require('../../common/serverEnvironment');
var applicationError = require('../../common/errors/ApplicationErrors');
var server = require('../../common/server');
var securityUtils = require('../../common/security/securityUtils');
var authController = require('../authentication/authentication.controller');
var objectID = require('mongodb').ObjectID;
var userController2 = require ('./v1/users.controller.v1');
var ldapDomainsService = require('../ldapDomains/v1/ldapDomains.service');
var groupsService = require('../groups/groups.service');
const logger = require('../../common/logger').default('users-controller');

var Q = require('q');
var _ = require('underscore');
var DO_PROMISE = true;


function userController()  {

    var getGroupsArray = function( groupsString ){

        var tmp;
        var copy = groupsString;
        var result = [ ];
        var adRegMask = /\[[0-9]{1,5}(,*[0-9]{1,5})*\]/g;
        while( tmp = adRegMask.exec( groupsString ) ){

            result.push( tmp[ 0 ] );
            copy = copy.replace( tmp[ 0 ], '' );
        }
        copy.split( ',' ).forEach( function( item ){

            if( item.length ){

                result.push( item );
            }
        } );
        return result;
    };

    this.getAll = function(req, res) {
        var limit = req.query["limit"] ? parseInt(req.query["limit"], 10) : null;
        var skip = req.query["skip"] ? parseInt(req.query["skip"], 10) : null;
        var search = req.query["search"] ? req.query["search"] : null;
        var groups = req.query["groups"] ? getGroupsArray( req.query["groups"] ) : null;
        var orderBy = req.query["orderby"] ? req.query["orderby"] : null;
        var isDesc = req.query["desc"] ? req.query["desc"] : false;
        var onlyAD = req.query["onlyAD"] ? req.query["onlyAD"] : false;
        var groupsNames = req.query["groupsNames"] ? req.query["groupsNames"] == "true" : false;
        var includeDomain = req.query["includeDomain"] === "true";

        onlyAD = onlyAD == "true"?true:false;
        isDesc = req.query["desc"] == "true"?true:false;

        userService.findUsers(limit,skip,search,groups,orderBy,isDesc, onlyAD, groupsNames, includeDomain, function (err, items) {
                //check for database error
                if (err) return server.error(res, err);
                userController2.hideUserSecrets(items);
                //send response
                res.send(items);
            });
    };

    this.getAdUsers = function(req, res) {
        var limit = req.query["limit"] ? parseInt(req.query["limit"], 10) : null;
        var search = req.query["search"] ? req.query["search"] : null;
        var checkExist = req.query["checkExist"] ? req.query["checkExist"] == "true" : false;
        var domainIdOrName = req.query["domain"];

        userService.findAdUsers(domainIdOrName, limit, search, checkExist, function (err, items) {
            //check for database error
            if (err) {
                return server.error(res, err);
            }

            //send response
            res.send(items);
        });
    };

    this.getAllDirectoriesUsers = function (req, res) {
        var limit = req.query["limit"] ? parseInt(req.query["limit"], 10) : null;
        var search = req.query["search"] ? req.query["search"] : null;
        var groups = req.query["groups"] ? getGroupsArray( req.query["groups"] ) : null;
        var includeDomain = req.query["includeDomain"] === "true";
        var CHECK_EXIST = true;

        userService.findUsers(limit, 0, search, groups, null, null, false, false, includeDomain, function (err, items) {
            //check for database error
            if (err) return server.error(res, err);

            if (items.length > 0){

                userController2.hideUserSecrets(items);
            }

            if (items.length === limit) {
                //send response
                res.send(items);
            } else {
                // case not enough found users in internal db -> check for users in AD
                userService.findAdUsers(undefined, limit, search, !CHECK_EXIST, function (err, ADitems) {
                    //check for database error
                    if (err) {

                        // temp! bug fix for ldap module
                        if (res.headersSent === true){
                            logger.error('-------ERROR------- ');
                            logger.error('you are trying to set response headers after they were sent. please take care of this');
                            logger.error(err);
                            logger.error('------------------- ');
                            return;
                        } else {

                            if (err.code === 405) { // no communication to AD server
                                return res.send({ error: { type: 'ad_comm' } });
                            }

                            if (err.code === 406) { // ldap is disabled or not exists
                                return res.send(items);
                            }

                            return server.error(res, err);
                        }
                    }

                    // filter out users found both in sisense and AD to prevent duplicates
                    var sisenseUsersObjectSids = items.reduce((array, item) =>
                                                    { if (item.objectSid) array.push(item.objectSid); return array; },
                                                    []);
                    ADitems = ADitems.filter(item => sisenseUsersObjectSids.indexOf(item.objectSid) === -1);

                    // take as much as needed to get to limit
                    ADitems = ADitems.slice(0, limit - items.length);
                    ADitems = _.map(ADitems, function (x) { return _.extend(x, {isAd: true}); });

                    //send response
                    res.send(items.concat(ADitems));
                });
            }
        });
    };

    this.count = function(req, res) {

        var search = req.query["search"] ? req.query["search"] : null;

        userService.countUsers(search, function (err, result) {
            //check for database error
            if (err) return server.error(res, err);
            //send response
            res.send(result)
        });
    }

    this.findByIdUsername = function(req, res) {
        var user = req.params.user;

        return userService.findByIdUsername(user, null, DO_PROMISE)
        .then(function(user){
            userController2.hideUserSecrets(user);
            server.sendSuccess(req, res, user);
        })
        .catch(function (err){
            server.error(res, err);
        });
    }

    this.findByIds = function(req, res) {
        var idsList = req.body;
        var includeDomain = req.query["includeDomain"] === "true";

        userService.findByIds(idsList, function (err, items) {
            //check for database error
            if (err) return server.error(res, err);

            userController2.hideUserSecrets(items);

            //send response
            res.send(items);
        }, false, includeDomain);
    }

    this.getLoggedInUser = function(req, res) {

        var loggedInUser = req.authentication.userObj;

        // Bring the manifest for the logged in user
        roleReadService.getRoleByIdOrName(loggedInUser.roleId, undefined, true)
        .then(function (role) {
            loggedInUser.userAuth = role.manifest;
            userController2.hideUserSecrets(loggedInUser);

            // extend with group's language
            return groupsService.findGroupsByArray(loggedInUser.groups, false, false, function(error, groups) {
                groups = _.sortBy(groups || [], 'name');

                var userGroupsLanguages = _.uniq(_.filter(_.pluck(groups, 'language'), Boolean));

                if (loggedInUser.preferences) {
                    loggedInUser.preferences.groupLanguage = userGroupsLanguages[0];
                } else {
                    loggedInUser.preferences = {
                        groupLanguage: userGroupsLanguages[0]
                    };
                }
                res.send(loggedInUser);
            });
        }).catch(function (err){
            logger.error('Error during get the logged in user role : ', err);
            return server.error(res, err);
        });
    };

    this.simulate = function(req, res) {
        var emailUserList = req.body;
        var admode = req.query["admode"] === "true";
        var ldapDomainId = req.query["ldapDomainId"];

        ldapDomainsService.getLdapDomains(undefined, undefined, undefined, {includeDecryptedPassword: true})
            .then(function (ldapDomains) {
                if (admode) {
                    if (!ldapDomainId) {
                        if (ldapDomains.length === 0 || ((ldapDomains.length === 1) && !ldapDomains[0].enabled)) {
                            return server.error(res, new applicationError.LdapDisabled("ActiveDirectory is disabled"));
                        }
                        if (ldapDomains.length > 1) {
                            return server.error(res, new applicationError.LdapDomainsError());
                        }

                        ldapDomainId = ldapDomains[0]._id.toHexString();
                    } else {
                        var ldapDomain = ldapDomains.filter(domain => domain._id.toHexString() === ldapDomainId)[0];

                        if (!ldapDomain) {
                            return server.error(res, new applicationError.LdapDomainNotFoundError());
                        } else if (!ldapDomain.enabled) {
                            return server.error(res, new applicationError.LdapDisabled("ActiveDirectory is disabled"));
                        }
                    }
                }

                userService.simulate(emailUserList, admode, ldapDomainId, function (err, item) {
                    //check for database error
                    if (err) return server.error(res, err);

                    if (admode){
                        ldapService.simulate(item, ldapDomainId, function(err, item){
                            if (err) return server.error(res, err);

                            //send response
                            res.send(item);
                        });
                    } else {
                        //send response
                        res.send(item);
                    }
                });
            });
    }

    this.addUser = function(req, res) {
       var newUsers = req.body;
       var notify = req.query["notify"]? req.query["notify"].toLowerCase() == 'true' :false;


        var usersAdded = [];

        var queryQueue =  _.map(newUsers,function(userItem){
            if(notify) return userService.inviteUser(req.authentication.userId,userItem,null,true);
            return  userService.addUser(userItem,req.authentication.userObj,null,true);
        })

        Q.all(queryQueue).then(function(results) {
            usersAdded = results;
        }, function(rej) {
            return server.error(res, rej);


        }).fail(function(err) {
                return server.error(res, err);

            }).fin(function() {
                if(notify) return  server.ok(res);
                userController2.hideUserSecrets(usersAdded.map(function (userArray) {return userArray[0]}));
                res.send(usersAdded);
            });
    }

    /**
     * Api to validate super user exist
     * this api get the license user to make him a super if needed
     * this api is only called by the installation process
     * @param  {[type]} req [description]
     * @param  {[type]} res [description]
     * @return {[type]}     [description]
     */
    this.verifySuperUser = function(req, res) {
        var secretParam = req.query["secret"];
        // Check that the secret is correct.
        // we don't want users to call this api, but only the installations
        // process
        if (secret !== secretParam){
            logger.error('secret is wrong');
            return server.error(res, new applicationError.General('secret is wrong'));
        }
        var licenseUser = req.body;
        superUserService.verifySuperUser(licenseUser)
        .then(function (result){
            res.send(result);
        })
        .catch(function (err){
            logger.error('Error verifySuperUser, Error : ', err);
            return server.error(res, new applicationError.General('Error verifySuperUser'));
        })

    }

    this.addAdUser = function(req, res) {
        var newUser = req.body;

        userService.addAdUser(newUser, req.authentication.userObj, true ,function (err, item) {
            //check for database error
            if (err) return server.error(res, err);

            userController2.hideUserSecrets(item.addedUsers);
            //send response
            res.send(item);
        });
    }

    this.inviteUser = function(req, res) {
        var newUsers = req.body;
        var queryQueue = [];

        queryQueue =  _.map(newUsers,function(userItem){
            return userService.inviteUser(req.authentication.userId,userItem,null,true);

        })

        Q.all(queryQueue).then(function(results) {

        }, function(rej) {
            return server.error(res, rej);


        }).fail(function(err) {
                return server.error(res, err);

            }).fin(function() {
                return  server.ok(res);

            });
    }

    this.activateUser = function(req, res) {
        var updateUser = req.body;
        var user = req.params.user;


        var urlSrc = serverEnvironment.getAppHomeUrl(req);
        urlSrc = req.query["src"]? serverEnvironment.convertToRelativeUrl(req.query["src"], req) : serverEnvironment.getAppHomeUrl(req);
        if(urlSrc === null||urlSrc === 'null') urlSrc = serverEnvironment.getAppHomeUrl(req);

        userService.findByIdUsername(user, function (err, userObj) {
            //check for database error
            if (err || !userObj) return server.error(res, err);

            updateUser.preferences = _.extend(userObj.preferences || {}, updateUser.preferences);

            userService.activateUser(user,updateUser, function (err, item) {
                //check for database error
                if (err) return server.error(res, err);

                // var cookie = encodeURIComponent(authController.getCookie(new objectID(userId), false));
                var strCookieTicketEncrypted =  authController.getCookie(userObj._id, true);

				var userAgent = res.req.headers['user-agent'];
				
				securityUtils.isSecureCookie().then(function (isSecureCookie) {
					res.cookie(env_config.cookie.name, strCookieTicketEncrypted,{ maxAge: securityUtils.getCookieMaxAge(userAgent), httpOnly: true,
						secure: isSecureCookie });

					return res.send({"id": userObj._id, "src":urlSrc});
				});
            });
        });
    };

    this.updateUser = function(req, res) {
        try
        {
            var user = req.params.user;
            var updateUser = req.body;

            userService.updateUserByIdUsername(user, updateUser, function (err, result) {
                //check for database error
                if (err) return server.error(res, err);
                //send response
                server.ok(res);
            });
        }
        catch (err)
        {
            return server.error(res, new applicationError.General(err));
        }
    }

    this.deleteUserByIdUsername = function(req, res) {
        var user = req.params.user;

        userService.deleteUserByIdUsername(user,null,true)
            .then(function(results) {

                res.sendStatus(204);
            }).fail(function(err) {

                return server.error(res, err);
            });
    }

    this.deleteUsers = function(req, res) {
        var userIds = req.body;

        var ids = userIds;
        var usersDeleted = [];
        var queryQueue = [];

        queryQueue =  _.map(ids,function(userId){
            return userService.deleteUser(userId,null,true);
        })


        Q.all(queryQueue).then(function(results) {
            usersDeleted = results;
        }, function(rej) {
            return server.error(res, rej);


        }).fail(function(err) {
                return server.error(res, err);

            }).fin(function() {
                res.send(usersDeleted);

            });


    }

    this.forgetPassword = function(req, res) {
        var email = req.body.email;

        userService.forgetPassword(email, function (err, item) {
            //check for database error
            //     if (err) return server.error(res, err);
            //send response
            server.ok(res);
        });
    }

    this.recoverPassword = function(req, res) {
        var updateUser = req.body;
        var user = req.params.user;

        var urlSrc = serverEnvironment.getAppHomeUrl(req);
        urlSrc = req.query["src"]? serverEnvironment.convertToRelativeUrl(req.query["src"], req) : serverEnvironment.getAppHomeUrl(req);
        if(urlSrc === null||urlSrc === 'null') urlSrc = serverEnvironment.getAppHomeUrl(req);

        userService.findByIdUsername(user, function (err, userObj) {
            //check for database error
            if (err || !userObj) return server.error(res, err);

            updateUser.preferences = _.extend(userObj.preferences || {}, updateUser.preferences);

            userService.recoverPassword(userObj._id.toHexString(), updateUser, function (err, item) {
                //check for database error
                if (err) return server.error(res, err);

                // var cookie = encodeURIComponent(authController.getCookie(new objectID(userId), false));
                var strCookieTicketEncrypted =  authController.getCookie(userObj._id, true) ;

				var userAgent = res.req.headers['user-agent'];
				
				securityUtils.isSecureCookie().then(function (isSecureCookie) {
					res.cookie(env_config.cookie.name, strCookieTicketEncrypted,{ maxAge: securityUtils.getCookieMaxAge(userAgent), httpOnly: true,
						secure: isSecureCookie });

					return res.send({"id": userObj._id, "src":urlSrc});
				});
            });
        });
    };

    this.validateEmails = function (req, res) {
        var emails = req.body;

        userService.validateEmails(emails, function (err, item) {
            //check for database error
            if (err) return server.error(res, err);

            userController2.hideUserSecrets(item.existingUsers);

            //send response
            res.send(item);
        });
    }
}

userController.instance = null;

userController.getInstance = function(){
    if(this.instance === null){
        this.instance = new userController();
    }
    return this.instance;
}

module.exports = userController.getInstance();
