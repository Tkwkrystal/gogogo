/**
 * Created by a.elkayam on 03/11/13.
 */

/**
 * Created with JetBrains WebStorm.
 * User: a.elkayam
 * Date: 15/09/13
 * Time: 17:39
 * To change this template use File | Settings | File Templates.
 */

var userService = module.exports = new userService();

// This is here and not on the top because licenseService call userService
// which create circular dependency
var licenseService = require('../../common/services/license.service');
var groupService = require('../groups/groups.service');

var applicationError = require('../../common/errors/ApplicationErrors');
var userMongo = require('./users.dal');
var groupMongo = require('../groups/groups.dal');
var userFactory = require('./users.factory');
var objectID = require('mongodb').ObjectID;
var promiseHandler =  require('../../common/promise');
var serverEnvironment = require('../../common/serverEnvironment');
var mailTemplateSender =  require('../emails/mailTemplateSender');
const logger = require('../../common/logger').default('users-service');

var Q = require('q');

var server = require('../../common/server');
var util = require('util');
var validator = require('../../common/utils/validator.util');
var _ = require('underscore');
var roleReadService = require('../roles/roleRead.service');
var ldapService = require('../ldap/ldap.service');
var ldapDomainsService = require('../ldapDomains/v1/ldapDomains.service');
var ldapDomainsErrors = require('../ldapDomains/v1/ldapDomains.errors');
var principalRemoval = require('../../common/principalRemoval.event');
var adGroupDeleted          = require('../ldap/adGroupDeleted.event');
var stringUtils             = require('../../common/utils/string.util');
var hashService = require('../../common/security/hash');
var crypto = require('crypto');
var dbUtils = require('../../common/dal/dbUtils');
var DO_PROMISE = true;
var EXPIRATION_TIME = 604800;

// subscribe to the event of principal removal
adGroupDeleted.register(userService.deleteByGroupSid);

function userService() {
    var self = this;

    this.findByQuery = function (limit, skip, query, orderByField) {

        return userMongo.findAll(limit, skip, orderByField, query, null, true)
            .then(function (users) {
                var attachRoleNameQueue = [];
                _.each(users, function(user){
                    attachRoleNameQueue.push(attacheRoleNameAndBaseRoleName(user));
                });
                return Q.all(attachRoleNameQueue);
            })
            .catch(function (error) {
                server.err(error);
            })
    };

    this.findUserByEmailUserName = function(emailOrUserName, checkActive){
        var escapedEmailOrUserName = stringUtils.escapeRegExp(emailOrUserName);
        var query = {$or:[{'userName': { "$regex" : '^' +escapedEmailOrUserName + '$', "$options" : "-i" }},{'email': { "$regex" : '^' +escapedEmailOrUserName + '$', "$options" : "-i" }}]};
        if (checkActive){
            query.active = true;
        }

        return userMongo.getUserByQueryPromise(query)
        .then(function (user){
            return attacheRoleNameAndBaseRoleName(user);
        }).then(function (user){
            if (!user){
                return null;
            }
            if(user.activeDirectory){
                return self.getGroups(user, null, DO_PROMISE)
                .then(function(groups){
                    user.resolevdGroups = _.chain(groups).pluck('_id').map(function(x){ return x.toHexString(); }).value();
                    //send respone
                    return user;
                });
            } else {
                //send respone
                return user;
            }
        });
    }

    this.findUsers = function(limit,skip,search,groups,orderByField,isDesc, onlyAD, groupsNames, includeDomain, callback,isPromise)
    {
        var deferredObj = Q.defer();
        var searchSpaceSplit = [];

        if(search)  {
            searchSpaceSplit = search.split(" ");
            // This escaping is for situation when we pass email with +
            // sign. and we don't want it to bo part of the regex
            // special signs but part of the string to search
            search = stringUtils.escapeRegExp(search);
        }

        var query = { };
        if( search ){

            query = {

                $or:[

                    {userName: new RegExp(search,"i")},
                    {email:   new RegExp(search,"i")},
                    {lastName:  new RegExp(search,"i")},
                    {firstName:  new RegExp(search,"i")}
                ]
            };
        }
        if( searchSpaceSplit.length >1 ){

            if( _.isArray( query.$or ) ){

                query.$or.push( {

                    lastName: new RegExp( stringUtils.escapeRegExp( searchSpaceSplit[ 0 ] ), "i" ),
                    firstName: new RegExp( stringUtils.escapeRegExp( searchSpaceSplit[ 1 ] ), "i" )
                } );
                query.$or.push( {

                    lastName: new RegExp( stringUtils.escapeRegExp( searchSpaceSplit[ 1 ] ), "i" ),
                    firstName: new RegExp( stringUtils.escapeRegExp( searchSpaceSplit[ 0 ] ), "i" )
                } );
            }
        }
        if( onlyAD ){

            query.activeDirectory = true;
        }
        if( groups && ~groups.length ){

            query = {

                $and: [

                    query,
                    {
                        $or: [
                            { groups: { $elemMatch: { $in: groups } } },
                            { adgroups: { $elemMatch: { $in: groups } } }
                        ]
                    }
                ]
            }
        }

        var orderBy = {};
        var orderByFieldsArr = [];
        if(orderByField)
        {
            orderByFieldsArr = orderByField.split(',');
            orderByFieldsArr.forEach(function(field){
                orderBy[field] = isDesc? -1:1;
            });
        }


        userMongo.findAll(limit,skip,orderBy,query, function (err, items) {
            //check for database error
            if (err)  return promiseHandler.promiseCallback(callback,isPromise,deferredObj,new applicationError.Database(err),null);

            var attachRoleNameQueue = [];
            _.each(items, function(user){
                attachRoleNameQueue.push(attacheRoleNameAndBaseRoleName(user));
            });
            Q.all(attachRoleNameQueue)
            .then(function (users) {
                if (includeDomain) {
                    return ldapDomainsService.getDomainDetailsForEntity(users);
                } else {
                    return users;
                }
            })
            .then(function (items){
                if (!groupsNames){
                    //send response
                    return promiseHandler.promiseCallback(callback,isPromise,deferredObj,null,items);
                }

                // getting the groups names
                var getGroupsPromises = [];
                for (var i = 0; i < items.length; i++) {
                    var user = items[i];
                    getGroupsPromises.push(self.getGroups(user, null, DO_PROMISE));
                }

                Q.all(getGroupsPromises)
                    .then(function (results) {
                        for (var i = 0; i < results.length; i++) {
                            var groupResult = results[i];
                            var user = items[i];
                            user.groups = groupResult;
                        }

                        //send response
                        return promiseHandler.promiseCallback(callback, isPromise, deferredObj, null, items);
                    })
                    .catch(function (err) {
                        return promiseHandler.promiseCallback(callback, isPromise, deferredObj, new applicationError.Database(err), null);
                    });
            });
        });

        if(isPromise) return deferredObj.promise;
    };

    this.isUsersExist = function (users) {

        var deferred = Q.defer();

        var promisesQueue = [];
        for (var i = 0; i < users.length; i++) {
            var user = users[i];
            // var email = user.mail || user.email;

            // var escapedEmail = stringUtils.escapeRegExp(email);
            // var escapedUserName = stringUtils.escapeRegExp(stringUtils.emailPrefix(user.userPrincipalName));
            // var query = {$or:[
            //     {'userName': { "$regex" : '^' +escapedEmail + '$', "$options" : "-i" }},{'email': { "$regex" : '^' +escapedEmail + '$', "$options" : "-i" }},
            //     {'userName': { "$regex" : '^' +escapedUserName + '$', "$options" : "-i" }},{'email': { "$regex" : '^' +escapedUserName + '$', "$options" : "-i" }}
            // ]};

            var uname;
            var principalName = user.principalName || user.userPrincipalName;
            if (principalName && principalName.indexOf('@') !== -1){
                uname = principalName.substr(0, principalName.indexOf('@'));
            } else {
                uname = principalName;
            }

            var queryOrArray =  [{ userName: uname}, { principalName: user.userPrincipalName }];
            if (user.objectSid) queryOrArray.push({ objectSid: user.objectSid});

            var query = { $or: queryOrArray, ldapDomainId: user.domain._id };

            promisesQueue.push(userMongo.getUserByQueryPromise(query));
        }

        Q.all(promisesQueue)
            .then(function (results) {
                for (var i = 0; i < results.length; i++) {
                    var userResult = results[i];
                    var user = users[i];
                    user.isExist = userResult != undefined && userResult != null;
                }

                deferred.resolve(users);
            })
            .catch(function (err) {
                deferred.reject(err);
            });

        return deferred.promise;
    };

    this.findAdUsers = function(domainIdOrName, limit, search, checkExist, callback, isPromise) {
        var deferredObj = Q.defer();
        ldapService.findUsers(domainIdOrName, limit, search, function (err, adUsers) {
                //check for database error
                if (err) {
                    return promiseHandler.promiseCallback(callback, isPromise, deferredObj, err, null);
                }

            if (!checkExist){
                //send response
                return promiseHandler.promiseCallback(callback, isPromise, deferredObj, null, adUsers);
            }

            self.isUsersExist(adUsers)
                .then(function (users) {
                    //send response
                    return promiseHandler.promiseCallback(callback, isPromise, deferredObj, null, users);
                })
                .catch(function (err) {
                    return promiseHandler.promiseCallback(callback, isPromise, deferredObj, new applicationError.Database(err), null);
                });
        });

        if (isPromise){
            return deferredObj.promise;
        }
    };

    this.countUsers = function(search,callback,isPromise)
    {
        var deferredObj = Q.defer();
        var query = {};
        var searchSpaceSplit = [];

        if(search)  {
            searchSpaceSplit = search.split(" ");
            // This escaping is for situation when we pass email with +
            // sign. and we don't want it to bo part of the regex
            // special signs but part of the string to search
            search = stringUtils.escapeRegExp(search);
        }

        if(search)  query = {$or:[{userName: new RegExp(search,"i")},{email:   new RegExp(search,"i")},{lastName:  new RegExp(search,"i")},{firstName:  new RegExp(search,"i")}]};

        if(searchSpaceSplit.length >1)
        {
            if (_.isArray(query.$or)) {
                query.$or.push({lastName: new RegExp(stringUtils.escapeRegExp(searchSpaceSplit[0]), "i"), firstName: new RegExp(stringUtils.escapeRegExp(searchSpaceSplit[1]), "i")});
                query.$or.push({lastName: new RegExp(stringUtils.escapeRegExp(searchSpaceSplit[1]), "i"), firstName: new RegExp(stringUtils.escapeRegExp(searchSpaceSplit[0]), "i")});
            }
        }

        userMongo.count(query, function (err, result) {
            //check for database error
            if (err)  return promiseHandler.promiseCallback(callback,isPromise,deferredObj,new applicationError.Database(err),null);
            //send response
            return promiseHandler.promiseCallback(callback,isPromise,deferredObj,null,result);
        });

        if(isPromise) return deferredObj.promise;
    };

    /**
     * Function to count how many users there is from each base role (
     * include children of the base role)
     * @return {Object} object with the keys represents the base roles names
     * and the value are the count of users from each role
     */
    this.countUsersBaseRoles = function(){

        var baseRoleGroups = {
         super : 0,
         admin : 0,
         contributor : 0,
         consumer : 0
     };
        var usersCountByRoles;
        // Get count users by roles
        return userMongo.countUsersByRoles()
        .then(function (result){
            usersCountByRoles = result;
            return roleReadService.getAllRoles({includeBaseRolesName : true});
        }).then(function (allRoles){
            // Map the roles count to base roles count
            _.each(usersCountByRoles, function (roleCount){
                // Find the role itself
                var role = _.find(allRoles, function(role){
                    // Take care of users without roleId
                    // count them as consumers
                    if (!roleCount._id){
                        return role.name === "consumer";
                    }
                    return role._id.toString() === roleCount._id.toString();
                });
                var baseRoleName = role.baseRoleName;
                // Set the count
                baseRoleGroups[baseRoleName] += roleCount.count;

            });

            return baseRoleGroups;
        });
    }

    this.findById = function(userId,callback,isPromise)
    {
        var deferredObj = Q.defer();

        userMongo.findById(userId, function (err, item) {
            //check for database error
            if (err)  return promiseHandler.promiseCallback(callback,isPromise,deferredObj,new applicationError.Database(err),null);
            //check if userItem found
            if (!item)  return promiseHandler.promiseCallback(callback,isPromise,deferredObj,new applicationError.NotFound("user not found"),null);
            attacheRoleNameAndBaseRoleName(item)
            .then(function (item){
                if(item.activeDirectory){
                    self.getGroups(item, function(err, groups){
                        if (err) {return promiseHandler.promiseCallback(callback,isPromise,deferredObj,new applicationError.Database(err),null);}
                        item.resolevdGroups = _.chain(groups).pluck('_id').map(function(x){ return x.toHexString(); }).value();
                        //send respone
                        return promiseHandler.promiseCallback(callback,isPromise,deferredObj,null,item);
                    });
                } else {
                    //send respone
                    return promiseHandler.promiseCallback(callback,isPromise,deferredObj,null,item);
                }
            });
        });

        if(isPromise) return deferredObj.promise;
    };

    this.findByIdUsername = function(value,callback,isPromise)
    {
        var deferredObj = Q.defer();

        userMongo.findByIdUsername(value, function (err, item) {
            //check for database error
            if (err)  return promiseHandler.promiseCallback(callback,isPromise,deferredObj,new applicationError.Database(err),null);
            //check if userItem found
            if (!item)  return promiseHandler.promiseCallback(callback,isPromise,deferredObj,new applicationError.NotFound("user not found"),null);

            attacheRoleNameAndBaseRoleName(item)
            .then(function (item){
                if(item.activeDirectory){
                    self.getGroups(item, function(err, groups){
                        if (err) {return promiseHandler.promiseCallback(callback,isPromise,deferredObj,new applicationError.Database(err),null);}
                        item.resolevdGroups = _.chain(groups).pluck('_id').map(function(x){ return x.toHexString(); }).value();
                        //send respone
                        return promiseHandler.promiseCallback(callback,isPromise,deferredObj,null,item);
                    });
                } else {
                    //send respone
                    return promiseHandler.promiseCallback(callback,isPromise,deferredObj,null,item);
                }
            });


        });

        if(isPromise) return deferredObj.promise;
    };

    this.findByRoleId = function(roleId){
        return userMongo.findByRoleId(roleId);
    };

    this.findByRoleName = function (name) {
        return roleReadService.getRoleByIdOrName(name)
            .then(function (role) {
                if (!role) throw 'could not find role with name ' + name;
                return self.findByRoleId(role._id);
            });
    };

    this.findByEmail = function(email,callback,isPromise)
    {
        var deferredObj = Q.defer();

        userMongo.findByEmail(email, function (err, item) {
            //check for database error
            if (err)  return promiseHandler.promiseCallback(callback,isPromise,deferredObj,new applicationError.Database(err),null);
            //check if userItem found
            if (!item)  return promiseHandler.promiseCallback(callback,isPromise,deferredObj,null,null);
            attacheRoleNameAndBaseRoleName(item)
            .then(function (item){
                if(item.activeDirectory){
                    self.getGroups(item, function(err, groups){
                        if (err) {return promiseHandler.promiseCallback(callback,isPromise,deferredObj,new applicationError.Database(err),null);}
                        item.resolevdGroups = _.chain(groups).pluck('_id').map(function(x){ return x.toHexString(); }).value();
                        //send respone
                        return promiseHandler.promiseCallback(callback,isPromise,deferredObj,null,item);
                    });
                } else {
                    //send respone
                    return promiseHandler.promiseCallback(callback,isPromise,deferredObj,null,item);
                }
            });
        });

        if(isPromise) return deferredObj.promise;
    };

    this.findByUserName = function(userName,callback,isPromise)
    {
        var deferredObj = Q.defer();

        userMongo.findByUserName(userName, function (err, item) {
            //check for database error
            if (err)  return promiseHandler.promiseCallback(callback,isPromise,deferredObj,new applicationError.Database(err),null);
            //check if userItem found
            if (!item)  return promiseHandler.promiseCallback(callback,isPromise,deferredObj,new applicationError.NotFound("user not found"),null);
            attacheRoleNameAndBaseRoleName(item)
            .then(function (item){
                if(item.activeDirectory){
                    self.getGroups(item, function(err, groups){
                        if (err) {return promiseHandler.promiseCallback(callback,isPromise,deferredObj,new applicationError.Database(err),null);}
                        item.resolevdGroups = _.chain(groups).pluck('_id').map(function(x){ return x.toHexString(); }).value();
                        //send respone
                        return promiseHandler.promiseCallback(callback,isPromise,deferredObj,null,item);
                    });
                } else {
                    //send respone
                    return promiseHandler.promiseCallback(callback,isPromise,deferredObj,null,item);
                }
            });
        });

        if(isPromise) return deferredObj.promise;
    };
    this.findByIds = function(idsList, callback, isPromise, includeDomain)
    {
        var deferredObj = Q.defer();

        for (var i = 0, l = idsList.length; i < l; i++) {
            idsList[i] = new objectID(idsList[i]);
        }

        var query = {
            _id: { "$in": idsList }
        };

        userMongo.getUsersByQuery(query, function (err, users) {
            // check for database error
            if (err)  return promiseHandler.promiseCallback(callback,isPromise,deferredObj,new applicationError.Database(err),null);
            // check if no were userItem found
            if (!users)  return promiseHandler.promiseCallback(callback,isPromise,
                deferredObj, new applicationError.NotFound("there is no users for the given ids list"), null);

            var attachRoleNameQueue = [];
            _.each(users, function(user){
                attachRoleNameQueue.push(attacheRoleNameAndBaseRoleName(user));
            });
            Q.all(attachRoleNameQueue)
            .then(function (users) {
                if (includeDomain) {
                    return ldapDomainsService.getDomainDetailsForEntity(users);
                } else {
                    return users;
                }
            })
            .then(function (users){
                // send response
                return promiseHandler.promiseCallback(callback, isPromise, deferredObj, null, users);
            });
        });

        if(isPromise) return deferredObj.promise;

    };

    this.simulate = function(emailList, admode, ldapDomainId, callback,isPromise)
    {
        var deferredObj = Q.defer();

        var retObject = {users:[],license:{}};
        var emailsQuery = [];
        var toBeAdded = [];
        var newEmailLst = [];
        var notValidEmailLst = [];

        emailList.forEach(function(email){
            if(validator.validEmail(email) || admode){
                // This escaping is for situation when we pass email with +
                // sign. and we don't want it to bo part of the regex
                // special signs but part of the string to search
                escapedEmail = stringUtils.escapeRegExp(email);
                emailsQuery.push({'userName': { "$regex" : "^"+ escapedEmail +"$", "$options" : "-i" }});
                emailsQuery.push({'email': { "$regex" :"^"+ escapedEmail +"$", "$options" : "-i" }});
                newEmailLst.push(email);
            }
            else
            {
                notValidEmailLst.push(email);
            }

        });

        var query = {$or:emailsQuery};

        if (admode) query = {$and: [query, {ldapDomainId: dbUtils.createId(ldapDomainId)}]};

        if(!newEmailLst.length) query = {'none':'none'};

        userMongo.findAll(null,null,{},query,function(err,items){
            //check for database error
            if (err)  return promiseHandler.promiseCallback(callback,isPromise,deferredObj,new applicationError.Database(err),null);

            if (admode){
                retObject.users = _.map(items,function(item){return {exist:true,roleId:"consumer",userName:item.userName};});
                newEmailLst.forEach(function(userName){
                    var filterResult = _.filter(retObject.users,function(user){return userName.toLowerCase() === user.userName.toLowerCase();});
                    if(!filterResult.length) retObject.users.push({exist:false,roleId:"consumer",userName:userName});
                    toBeAdded.push({exist:false,roleId:"consumer",userName:userName});

                });
            } else {

                retObject.users = _.map(items,function(item){return {exist:true,roleId:"consumer",email:item.email};});
                newEmailLst.forEach(function(email){
                    var filterResult = _.filter(retObject.users,function(user){return email.toLowerCase() === user.email.toLowerCase();});
                    if(!filterResult.length) retObject.users.push({exist:false,roleId:"consumer",email:email});
                    toBeAdded.push({exist:false,roleId:"consumer",email:email});

                });
            }

            licenseService.getLeftLicenses()
            .then(function(leftLicenses){
               retObject.license = leftLicenses;

               //send response
               return promiseHandler.promiseCallback(callback,isPromise,deferredObj,null,retObject);
           });
        });


        if(isPromise) return deferredObj.promise;
    };


    this.addUser = function(user,addingUser,callback,isPromise)
    {
        var deferredObj = Q.defer();
        var promiseUpdatePassword = user.password ? hashService.create(user.password).then(function (newHash) {
            user.hash = newHash;
        }) : Q.when();

        promiseUpdatePassword.then(function () {
            userFactory.create(user)
                .then(function (newUser){
                    var queryOrArray = [];
                    if (newUser.email) queryOrArray.push({'email': { "$regex" : '^' + stringUtils.escapeRegExp(newUser.email) + '$', "$options" : "i" }});
                    if (newUser.userName) {
                        queryOrArray.push(  {'email': { "$regex" : '^' + stringUtils.escapeRegExp(newUser.userName) + '$', "$options" : "i" }});
                        queryOrArray.push(  {'userName': { "$regex" : '^' + stringUtils.escapeRegExp(newUser.userName) + '$', "$options" : "i" },
                            activeDirectory: {$ne: true}});
                    }

                    var query = {$or: queryOrArray};

                    //check if user already exist
                    userMongo.getUserByQuery(query,  function(err,userItem) {
                        //check for database error
                        if (err)  return promiseHandler.promiseCallback(callback,isPromise,deferredObj,new applicationError.Database(err),null);
                        if(userItem) return promiseHandler.promiseCallback(callback,isPromise,deferredObj,new applicationError.badRequest('User already exist'),null);

                        // add user
                        userMongo.add(newUser, function (err, items) {

                            //check for database error
                            if (err)  return promiseHandler.promiseCallback(callback,isPromise,deferredObj,new applicationError.Database(err),null);

                            if (newUser.email) {
                                mailTemplateSender.userCreated(addingUser,newUser,function(err,result){
                                    if(err) logger.error('userCreated mail fail to  sent ' +err);

                                    //send response
                                    return promiseHandler.promiseCallback(callback,isPromise,deferredObj,null,items);
                                });
                            } else {
                                //send response
                                return promiseHandler.promiseCallback(callback,isPromise,deferredObj,null,items);
                            }
                        });
                    });
                });
        });

        if(isPromise) return deferredObj.promise;
    };

    this.addAdUser = function(users,addingUser,sendCreatedMail,callback,isPromise)
    {
        var deferredObj = Q.defer();

        ldapDomainsService.attachValidLdapDomain(users)
            .then(function (users) {
                var addUserQueue = [];
                users.forEach(function(user){
                    addUserQueue.push(addADUser(user,null,true));
                });

                var addedUsers;
                var addResults = {};

                Q.all(addUserQueue)
                    .then(function(results) {
                        addResults.noActiveDirectoryUsers = _.filter(results,function(item){return !item.exists;});

                        addedUsers = _.filter(results,function(item){return item.exists;});
                        addedUsers = _.map(addedUsers,function(item){return item.user;});

                        addResults.addedUsers = [];

                        if(!addedUsers.length) {
                            return promiseHandler.promiseCallback(callback,isPromise,deferredObj,null,addResults);
                        }

                        return checkExistence(addedUsers);
                    }).then(function () {
                        userMongo.add(addedUsers, function (err, items) {
                            //check for database error
                            if (err)  return promiseHandler.promiseCallback(callback,isPromise,deferredObj,new applicationError.Database(err),null);
                            // Sending notification mail (non-blocking)
                            if (sendCreatedMail){
                                var url = serverEnvironment.getUserLoginUrl();
                                _.each(items.filter(user => user.email),function(user){
                                    mailTemplateSender.userCreatedFromAD(addingUser,user,url);
                                })
                            }

                            //send response
                            addResults.addedUsers = items;
                            return promiseHandler.promiseCallback(callback,isPromise,deferredObj,null,addResults);
                        });
                    })
                    .catch(function(err) {
                        return promiseHandler.promiseCallback(callback,isPromise,deferredObj,err,null);

                    });
            }).catch(function (err) {
                return promiseHandler.promiseCallback(callback, isPromise, deferredObj, new applicationError.badRequest(err), null);
            });

        if(isPromise) return deferredObj.promise;
    };

    function checkExistence(users) {
        var queryOrArray = [];

        users.forEach(user => {
            var userEmail = user.email || user.mail;
            if (userEmail) queryOrArray.push({'email': { "$regex" : '^' + stringUtils.escapeRegExp(userEmail) + '$', "$options" : "i" }});
            if (user.userName) queryOrArray.push({'email': { "$regex" : '^' + stringUtils.escapeRegExp(user.userName) + '$', "$options" : "i" }});

            var innerOrQuery = [];

            if (user.userName) innerOrQuery.push({'userName': { "$regex" : '^' + stringUtils.escapeRegExp(user.userName) + '$', "$options" : "i" }});
            if (user.principalName) innerOrQuery.push({'principalName': { "$regex" : '^' + stringUtils.escapeRegExp(user.principalName) + '$', "$options" : "i" }});
            if (user.objectSid) innerOrQuery.push({'objectSid': user.objectSid});

            if (innerOrQuery.length > 0) queryOrArray.push({activeDirectory: true, ldapDomainId: dbUtils.createId(user.ldapDomainId), $or: innerOrQuery});
        });

        return userMongo.getUsersByQueryPromise({ $or: queryOrArray })
            .then(function (alreadyExistUsers) {
                if (alreadyExistUsers.length > 0) {
                    throw (new applicationError.badRequest('User name or email already exists'));
                }
            });
    }

    function addADUser(user,callback,isPromise)
    {
        var deferredObj = Q.defer();

        ldapDomainsService.getLdapDomain(user.ldapDomainId, undefined, undefined, {includeDecryptedPassword: true}).then(function (ldapDomain) {
            if (!ldapDomain) {
                return promiseHandler.promiseCallback(callback, isPromise,deferredObj,
                    new applicationError.badRequest(new ldapDomainsErrors.LdapDomainNotFoundError(user.ldapDomainId)), null);
            }

            if (!ldapDomain.enabled) {
                return promiseHandler.promiseCallback(callback, isPromise, deferredObj,
                    new applicationError.badRequest(new ldapDomainsErrors.LdapDomainDisabled(user.ldapDomainId)), null);
            }

            var ldapDomainObject = ldapDomainsService.createLdapDomainObject(ldapDomain);

            ldapService.findUser(user.dn || user.userName, ldapDomainObject, function(err, ADuser) {

                if (err) return promiseHandler.promiseCallback(callback,isPromise,deferredObj, err, null);
                if (!ADuser) return promiseHandler.promiseCallback(callback,isPromise,deferredObj,null,{user:user,exists:false});

                ADuser.roleId = user.roleId;
                ADuser.ldapDomainId = user.ldapDomainId;

                userFactory.createAdUser(ADuser)
                .then(function (newUser){
                    return promiseHandler.promiseCallback(callback,isPromise,deferredObj,null,{user:newUser,exists:true});
                });
            });
        });

        if(isPromise) return deferredObj.promise;
    }


    this.inviteUser = function(inviteId,user,callback,isPromise)
    {
        var deferredObj = Q.defer();
        var email = user.email;
        var needActivation = true;
        var generatedToken;

        Q.when(crypto.randomBytes(20))
            .then(function (token) {
                if (!token) {
                    // what exception should be thrown here?
                    throw 'faild to generate token';
                }

                generatedToken = token.toString('hex');

                user.activationToken = generatedToken;
                user.activationExpires = Date.now() + (1000 * EXPIRATION_TIME);

                return userFactory.create(user, needActivation)
            })
            .then(function (invitedUser) {
                // get admin user
                self.findById(inviteId.id,function(err,adminUser){
                    // add user
                    userMongo.add(invitedUser, function (err, items) {
                        //check for database error
                        if (err)  return promiseHandler.promiseCallback(callback,isPromise,deferredObj,new applicationError.Database(err),null);
                        var url = util.format(serverEnvironment.getUserActivationUrl(), generatedToken);

                        mailTemplateSender.newUserInvitation(adminUser,invitedUser,url,function(err,result){
                            if(err) logger.error('newUserInvitation mail fail to  sent ' +err);
                            if(!err) logger.info('newUserInvitation mail  sent' +result);
                        });
                        //send response
                        return promiseHandler.promiseCallback(callback,isPromise,deferredObj,null,true);

                    });
                });
            });

        if(isPromise) return deferredObj.promise;
    };

    this.forgetPassword = function(email,callback,isPromise)
    {
        var deferredObj = Q.defer();

        var forgetPasswordUser = userFactory.forgetPassword();
        var query = {email:email};
        userMongo.getUserByQuery(query,function(err,userItem){

            if (err) {

                return promiseHandler.promiseCallback(callback,isPromise,deferredObj,new applicationError.Database(err),null);

            }
            else if (!userItem){

                return promiseHandler.promiseCallback(callback,isPromise,deferredObj,new applicationError.NotFound("email not found"),null);
            }
            else
            {
                userMongo.update(userItem._id.toHexString(),forgetPasswordUser,function(err,result){


                        var url = util.format(serverEnvironment.getUserForgetPasswordUrl(), userItem._id.toHexString(),userItem.userName);

                        mailTemplateSender.passwordRecovery(userItem,url,function(err,result){
                            if(err) logger.error('passwordRecovery mail fail to  sent ' +err);
                            if(!err) logger.info('passwordRecovery mail  sent' +result);
                        });
                        return promiseHandler.promiseCallback(callback,isPromise,deferredObj,null,true);


                });

            }

        });

        if(isPromise) return deferredObj.promise;
    };

    this.inviteUsers = function(shareNewArr,callback,isPromise)
    {
        var deferredObj = Q.defer();
        var newUserLst = [];
        var newUserLstQueue = [];

        function createInvitedUser(email, roleId, dashboardRule){
            var DO_NEED_ACTIVATION = true;
            var invitedUser = {
                email : email,
                roleId: roleId,
                dashboardRule : dashboardRule
            };

            var token = crypto.randomBytes(20).toString('hex');

            if (!token) {
                // what exception should be thrown here?
                throw 'faild to generate token';
            }

            invitedUser.activationToken = token.toString('hex');
            invitedUser.activationExpires = Date.now() + (1000 * EXPIRATION_TIME);

            return userFactory.create(invitedUser, DO_NEED_ACTIVATION);
        }

        shareNewArr.forEach(function(shareNewArr){
            newUserLstQueue.push(createInvitedUser(shareNewArr.email, shareNewArr.roleId, shareNewArr.rule));
        });

        Q.all(newUserLstQueue)
        .then(function (newUserLst){
            if(newUserLst.length === 0)  return promiseHandler.promiseCallback(callback,isPromise,deferredObj,null,newUserLst);

            // add user
            userMongo.add(newUserLst, function (err, items) {
                //check for database error
                if (err)  return promiseHandler.promiseCallback(callback,isPromise,deferredObj,new applicationError.Database(err),null);
                //send response
                return promiseHandler.promiseCallback(callback,isPromise,deferredObj,null,items);
            });
        });


        if(isPromise) return deferredObj.promise;
    };

    this.activateUser = function(user,userObj,callback,isPromise)
    {
        var deferredObj = Q.defer();

        var activateUser = userFactory.activateUser(userObj);

        //check if user already exist
        userMongo.updateByIdUsername(user, activateUser, function(err,result) {
            //check for database error
            if (err)  return promiseHandler.promiseCallback(callback,isPromise,deferredObj,new applicationError.Database(err),null);
            //check if userItem found
            if (!result)  return promiseHandler.promiseCallback(callback,isPromise,deferredObj,new applicationError.NotFound("user can not activate"),null);
            //send response
            return promiseHandler.promiseCallback(callback,isPromise,deferredObj,null,result);
        });

        if(isPromise) return deferredObj.promise;
    };

    this.recoverPassword = function(userId,user,callback,isPromise)
    {
        var deferredObj = Q.defer();

        var recoverPasswordUser = userFactory.recoverPasswordUser(user);

        //check if user already exist
        userMongo.update(userId,recoverPasswordUser,  function(err,result) {
            //check for database error
            if (err)  return promiseHandler.promiseCallback(callback,isPromise,deferredObj,new applicationError.Database(err),null);
            //check if userItem found
            if (!result)  return promiseHandler.promiseCallback(callback,isPromise,deferredObj,new applicationError.NotFound("user can not activate"),null);
            //send response
            return promiseHandler.promiseCallback(callback,isPromise,deferredObj,null,result);
        });

        if(isPromise) return deferredObj.promise;
    };


    this.updateUser = function(userId,updateUser,callback,isPromise, shouldUpdateAsIs)
    {
        var deferredObj = Q.defer();

        userFactory.update(updateUser)
        .then(function (updateUser){
            var callbackFn = function (err, result) {
                //check for database error
                if (err)  return promiseHandler.promiseCallback(callback,isPromise,deferredObj,new applicationError.Database(err),null);
                //check if userItem found
                if (!result)  return promiseHandler.promiseCallback(callback,isPromise,deferredObj,new applicationError.NotFound("user not found"),null);
                //send response
                return promiseHandler.promiseCallback(callback,isPromise,deferredObj,null,result);
            };

            userMongo.update(userId, updateUser, callbackFn, shouldUpdateAsIs);
        });


        if(isPromise) return deferredObj.promise;
    };

    this.updateUserByIdUsername = function(user, updateUser, callback, isPromise) {
        var deferredObj = Q.defer();

        var promiseUpdatePassword = updateUser.password ? hashService.create(updateUser.password).then(function (newHash) {
            updateUser.hash = newHash;
        }) : Q.when();

        promiseUpdatePassword.then(function () {
            userFactory.update(updateUser)
                .then(function (updateUser){
                    userMongo.updateByIdUsername(user, updateUser, function (err, result) {
                        //check for database error
                        if (err)  return promiseHandler.promiseCallback(callback,isPromise,deferredObj,new applicationError.Database(err),null);
                        //check if userItem found
                        if (!result)  return promiseHandler.promiseCallback(callback,isPromise,deferredObj,new applicationError.NotFound("user not found"),null);
                        //send response
                        return promiseHandler.promiseCallback(callback,isPromise,deferredObj,null,result);
                    });
                });
        });
        if(isPromise) return deferredObj.promise;
    };

    this.deleteUser = function(userId,callback,isPromise)
    {
        var deferredObj = Q.defer();

        userMongo.delete(userId, function (err, result) {
            //check for database error
            if (err)  return promiseHandler.promiseCallback(callback,isPromise,deferredObj,new applicationError.Database(err),null);
            //check if userItem found
            if (!result)  return promiseHandler.promiseCallback(callback,isPromise,deferredObj,new applicationError.NotFound("user not found"),null);

            // delete the group from all the resources
            principalRemoval.notifyObservers([{ id: userId, type: 'user' }]);

            //send respone
            return promiseHandler.promiseCallback(callback,isPromise,deferredObj,null,result);
        });

        if(isPromise) return deferredObj.promise;
    };

    this.deleteUserByIdUsername = function(user,callback,isPromise)
    {
        var deferredObj = Q.defer();

        userMongo.findByIdUsername(user, function (err, selectedUser) {
            //check for database error
            if (err) return promiseHandler.promiseCallback(callback,isPromise,deferredObj,new applicationError.Database(err),null);
            //check if userItem found
            if (!selectedUser) return promiseHandler.promiseCallback(callback,isPromise,deferredObj,new applicationError.NotFound("user not found"),null);

            userMongo.deleteByIdUsername(user, function (err, result) {
                //check for database error
                if (err) return promiseHandler.promiseCallback(callback,isPromise,deferredObj,new applicationError.Database(err),null);
                //check if userItem found
                if (!result) return promiseHandler.promiseCallback(callback,isPromise,deferredObj,new applicationError.NotFound("user not found"),null);

                // delete the group from all the resources
                principalRemoval.notifyObservers([{ id: selectedUser._id && selectedUser._id.toHexString(), type: 'user' }]);

                //send response
                return promiseHandler.promiseCallback(callback,isPromise,deferredObj,null,result);
            });
        });

        if(isPromise) return deferredObj.promise;
    };

    this.getGroups = function(user, callback, isPromise){
        var deferredObj = Q.defer();
        var query = {};
        var isAD = user.activeDirectory || false;
        var userGroups = isAD ? user.adgroups : user.groups;
        var groupsResult;

        groupService.findGroupsByArray(userGroups, isAD, true, null, DO_PROMISE)
            .then(function (groups){
                groupsResult = groups;

                if (isAD && user.groups && !_.isEmpty(user.groups)){

                    // case ad user with mixed groups
                    groupService.findGroupsByArray(user.groups, false, true, null, DO_PROMISE)
                        .then(function (groups){
                            groupsResult = _.union(groupsResult, groups);
                            //send response
                            return promiseHandler.promiseCallback(callback, isPromise, deferredObj, null, groupsResult);
                        })
                        .fail(function (err) {
                            return promiseHandler.promiseCallback(callback, isPromise, deferredObj, new applicationError.Database(err), null);
                        });

                } else {

                    //case internal or ad not mixed groups user
                    return promiseHandler.promiseCallback(callback, isPromise, deferredObj, null, groupsResult);
                }
            }).fail(function (err){
                return promiseHandler.promiseCallback(callback, isPromise, deferredObj, new applicationError.Database(err), null);
            });

        if(isPromise) return deferredObj.promise;
    };

    this.getGroupsIncludingBuiltInGroups = function(user){
        var groups;
        return self.getGroups(user, null, DO_PROMISE)
        .then(function(g){
            groups = g || [];
            var query = {"$or" : [{everyone : true}]};
            if (user.baseRoleName === "super" || user.baseRoleName === "admin"){
                query.$or.push({admins : true});
            }
            return Q.ninvoke(groupMongo, "getGroupsByQuery", query);
        }).then(function(builtInGroups){
            var allGroups = groups.concat(builtInGroups);
            return allGroups;
        });
    }



    this.findByGroupId = function (groupId, callback, isPromise) {
        var deferredObj = Q.defer();

        userMongo.findByGroupId(groupId, function (err, users) {
            //check for database error
            if (err) {
                return promiseHandler.promiseCallback(callback, isPromise, deferredObj, new applicationError.Database(err), null);
            }

            var attachRoleNameQueue = [];
            _.each(users, function(user){
                attachRoleNameQueue.push(attacheRoleNameAndBaseRoleName(user));
            });
            Q.all(attachRoleNameQueue)
            .then(function (users){
                //send response
                return promiseHandler.promiseCallback(callback, isPromise, deferredObj, null, users);
            });
        });

        if(isPromise) {
            return deferredObj.promise;
        }
    };

    this.findByGroupSid = function (groupSid, callback, isPromise) {
        var deferredObj = Q.defer();

        userMongo.findByGroupSid(groupSid, function (err, users) {
            //check for database error
            if (err) {
                return promiseHandler.promiseCallback(callback, isPromise, deferredObj, new applicationError.Database(err), null);
            }

            var attachRoleNameQueue = [];
            _.each(users, function(user){
                attachRoleNameQueue.push(attacheRoleNameAndBaseRoleName(user));
            });
            Q.all(attachRoleNameQueue)
            .then(function (users){
                //send response
                return promiseHandler.promiseCallback(callback, isPromise, deferredObj, null, users);
            });

        });

        if(isPromise) {
            return deferredObj.promise;
        }
    };

    this.addGroup = function (user, groupId, callback, isPromise) {
        var deferredObj = Q.defer();

        userMongo.findByIdUsername(user, function(err, userItem) {
            //check for database error
            if (err) {
                return promiseHandler.promiseCallback(callback,isPromise,deferredObj,new applicationError.Database(err),null);
            }

            //check if userItem found
            if (!userItem) {
                return promiseHandler.promiseCallback(callback,isPromise,deferredObj,new applicationError.NotFound("user not found"),null);
            }

            if (userItem.groups && userItem.groups.length > 0 && _.contains(userItem.groups, groupId)){
                // user already has the groupId
                return promiseHandler.promiseCallback(callback,isPromise,deferredObj,null, userItem._id.toHexString());
            }

            // add the groupId to the user
            userMongo.addGroup(userItem._id.toHexString(), groupId, function (err, item) {
                //check for database error
                if (err) {
                    return promiseHandler.promiseCallback(callback,isPromise,deferredObj,new applicationError.Database(err),null);
                }

                // send response
                return promiseHandler.promiseCallback(callback,isPromise,deferredObj,null, userItem._id.toHexString());
            });
        });

        if(isPromise) {
            return deferredObj.promise;
        }
    };

    this.removeGroup = function (user, groupId, callback, isPromise) {
        var deferredObj = Q.defer();

        userMongo.findByIdUsername(user, function(err, userItem) {
            //check for database error
            if (err) {
                return promiseHandler.promiseCallback(callback,isPromise,deferredObj,new applicationError.Database(err),null);
            }

            //check if userItem found
            if (!userItem) {
                return promiseHandler.promiseCallback(callback,isPromise,deferredObj,new applicationError.NotFound("user not found"),null);
            }

            if (userItem.groups && userItem.groups.length > 0 && !_.contains(userItem.groups, groupId)){
                // user does not has the groupId
                return promiseHandler.promiseCallback(callback,isPromise,deferredObj,new applicationError.NotFound("user does not has this group"),null);
            }

            // remove the groupId from the user
            userMongo.removeGroup(userItem._id.toHexString(), groupId, function (err, item) {
                //check for database error
                if (err) {
                    return promiseHandler.promiseCallback(callback,isPromise,deferredObj,new applicationError.Database(err),null);
                }

                // send response
                return promiseHandler.promiseCallback(callback,isPromise,deferredObj,null, userItem._id.toHexString());
            });
        });

        if(isPromise) {
            return deferredObj.promise;
        }
    };

    this.validateEmails = function(emails, callback, isPromise) {
        var deferredObj = Q.defer();
        var reqEmails = _.map(emails, function (x) { return new RegExp("^" + stringUtils.escapeRegExp(x) + "$", "i"); });
        var query = { email: {$in: reqEmails} };

        userMongo.findAll(null,null,{},query, function (err, items) {
            //check for database error
            if (err)  return promiseHandler.promiseCallback(callback,isPromise,deferredObj,new applicationError.Database(err),null);

            var result = {
                isValid: false,
                existingUsers: items
            };

            result.isValid = items && (items.length === emails.length);

            //send response
            return promiseHandler.promiseCallback(callback,isPromise,deferredObj,null,result);
        });

        if(isPromise) return deferredObj.promise;
    };

    this.deleteByGroupSid = function(groupId,groupSid,deleteUsers)
    {
        var deferredObj = Q.defer();

        if (deleteUsers){
            var usersToDelete = [];
            var principals = [];
            var usersToCheckQueue = [];
            var currUser;
            var checkUser = function(user){
                return groupService.findGroupsByArray(user.adgroups, true, true, null, DO_PROMISE)
                    .then(function (groups){
                        if (groups.length === 0){
                            return user._id;
                        } else {
                            return;
                        }
                    });
            };
            userMongo.findByGroupSid(groupSid, function (err, users) {
                //check for database error
                if (err)  {return false;}
                _.each(users, function(user){
                    currUser = user;
                    usersToCheckQueue.push(checkUser(user));
                });
                Q.all(usersToCheckQueue)
                .then(function (results){
                    /*usersToDelete = _.reject(results, function(user){
                        return !user;
                    });
                    var principals = _.map(usersToDelete, function(userId){
                        return {
                            id : userId.toString(),
                            type : 'user'
                        };
                    });*/
                    _.each(results, function(userId){
                        if (userId){
                            usersToDelete.push(userId);
                            principals.push({ id : userId.toHexString(), type : 'user'});
                        }
                    });

                    var query = {'_id' : {$in: usersToDelete}};
                    userMongo.deleteByQuery(query, function (err, result) {
                        if (err)  {return false;}
                        principalRemoval.notifyObservers(principals);
                        return true;
                    });
                }).fail(function(err) {
                    return false;
                });
            });

            return deferredObj.promise;
        } else {
            return Q.fcall(function () {
                return true;
            });
        }
    };

    function attacheRoleNameAndBaseRoleName(user){
        if (!user){
            return Q.when(null);
        }
        return Q.all([roleReadService.getRoleByIdOrName(user.roleId),
        roleReadService.getBaseRoleByRoleIdOrName(user.roleId)])
        .spread(function(role, baseRole){
            user.roleName = role.name;
            user.baseRoleName = baseRole.name;
            return user;
        }).catch(function(err){
            logger.error('Error attaching role and base role name for user : ', user, 'Error : ', err);
            return user;
        });
    }
}
