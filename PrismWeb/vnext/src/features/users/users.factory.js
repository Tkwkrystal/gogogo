/**
 * Created with JetBrains WebStorm.
 * User: a.elkayam
 * Date: 03/10/13
 * Time: 12:52
 * To change this template use File | Settings | File Templates.
 */
var objectID = require('mongodb').ObjectID;
var roleReadService = require('../roles/roleRead.service');
var _ = require('underscore');
var Q = require('q');
var dbUtils = require('../../common/dal/dbUtils');


function userFactory()
{
    var self = this;

    function getPropertyValueOrDefault(obj, atts){
        for (var i = atts.length - 1; i >= 0; i--) {
            if (obj.hasOwnProperty(atts[i])){
                return obj[atts[i]];
            }
        };

        return undefined;
    }

    function toUserModel(userItem, isUpdating){
        return verifyRoles(userItem)
        .then(function (userItem){
            var uname;
            var sid;
            var adgroups;
            var principalName = userItem.principalName || userItem.userPrincipalName;
            if (principalName && principalName.indexOf('@') !== -1){
                uname = principalName.substr(0, principalName.indexOf('@'));
            } else {
                uname = principalName;
            }
            if (userItem.adgroups){
                adgroups = _.pluck(userItem.adgroups, "objectSid");
                if (adgroups[0] === undefined){
                    adgroups = userItem.adgroups;
                } else {
                    adgroups = _.map(adgroups, function(adgroup){
                        if (_.isArray(adgroup)){
                            return new Buffer(adgroup);
                        } else {
                            return adgroup;
                        }
                    });
                }
            }

            if (userItem.objectSid && _.isArray(userItem.objectSid)){
                sid = new Buffer(userItem.objectSid);
            }

            var newUser = {
                "roleId":userItem.roleId || undefined,
                "hash":userItem.hash || undefined,
                "userName": userItem.userName || uname,
                "firstName" : getPropertyValueOrDefault(userItem, ["givenName", "firstName"]),
                "lastName" : getPropertyValueOrDefault(userItem, ["sn", "lastName"]),
                "principalName" : principalName || undefined,
                "objectSid" : sid || userItem.objectSid || undefined,
                "uSNChanged": userItem.uSNChanged || undefined,
                "email": getPropertyValueOrDefault(userItem, ["email", "mail"]),
                "groups": userItem.groups || undefined,
                "adgroups": adgroups,
                "dn" : userItem.dn || undefined,
                "active":_(userItem).has("active") ? userItem.active : undefined,
                "pendingExpiration":userItem.pendingExpiration || undefined,
                "created": userItem.created || undefined,
                "lastUpdated": userItem.lastUpdated || undefined,
                "lastLogin": userItem.lastLogin || undefined,
                "activeDirectory": userItem.activeDirectory || undefined,
                "secrets": userItem.secrets || undefined,
                "resetPasswordToken": userItem.resetPasswordToken || undefined,
                "resetPasswordExpires": userItem.resetPasswordExpires || undefined,
                "activationToken": userItem.activationToken || undefined,
                "activationExpires": userItem.activationExpires || undefined,
                "createdSso" : userItem.createdSso || undefined,
                "ldapDomainId" : userItem.ldapDomainId || undefined
                // TODO: add more fields such as ssoToken/jti, ssoTokenIat, and more
            };

            if (userItem.preferences) {

                // we must use dot-notation to avoid rewriting of all nested object
                if (isUpdating) {
                    newUser['preferences'] = {
                        localeId: userItem.preferences.localeId,
                        language: userItem.preferences.language
                    };
                } else {
                    newUser.preferences = _.pick(userItem.preferences, ['localeId', 'language']);
                }
            }

            // remove undefined keys
            Object.keys(newUser).forEach(function(k) {
                if (newUser[k] == undefined) {
                    delete newUser[k];
                }
            });

            return newUser;
        });
    }

    function baseCreate(userItem){
        var now =  new Date();
        userItem.created = now;
        userItem.lastUpdated = now;
        userItem.lastLogin = now;
        if (!userItem.roleId){
            userItem.roleId = "consumer";
        }
        return userItem;
    }

    this.create = function(userItem, needActivation)
    {
        userItem.email = userItem.email?userItem.email:'';
        userItem.userName = userItem.userName?userItem.userName:userItem.email;
        if (!userItem.firstName){
            var  fname = userItem.email?userItem.email.split('@')[0].trim():'';
            if (fname.charAt(0) === '(') {
                var end = fname.indexOf(')');
                fname = fname.substring(1,end);
            }
            userItem.firstName = fname.trim();
        }
        userItem = baseCreate(userItem)
        userItem.active = true;

        if (userItem.hasOwnProperty('ldapDomainId')) delete userItem.ldapDomainId;

        if (needActivation){
            userItem.active = false;
            var expirationDate =  new Date();
            expirationDate.setDate(expirationDate.getDate() + 7);
            userItem.pendingExpiration = expirationDate;
        }

        return (toUserModel(userItem));
    };

    this.createSuper = function(userItem)
    {
        userItem.roleId = "super";
        return self.create(userItem, false);
    };

    function verifyRoles(userItem) {
        if (!userItem.roleId){
            return Q.when(userItem);
        }

        // Check if the role is in the old format ({admin:false, contributor
        // :true, consumer : false})
        if (typeof userItem.roleId === "object" &&
            !dbUtils.isObjectId (userItem.roleId)){
            // Convert the role to the new format - roleId
            userItem.roleId = getRoleNameFromOldFormat(userItem.roleId);
        }

        return roleReadService.getRoleByIdOrName(userItem.roleId).
        then(function (role){
            userItem.roleId = role._id;
            return userItem;
        // If the role doesn't exist we set it to consumer
        }).catch(function (err){
            return roleReadService.getRoleByIdOrName('consumer')
            .then(function (consumerRole){
                userItem.roleId = consumerRole._id;
                return userItem;
            });
        });
    }

    function getRoleNameFromOldFormat(role){
        if (role.super === true){
            return "super";
        }
        if (role.admin === true){
            return "admin";
        }
        if (role.contributor === true){
            return "contributor";
        }

        return "consumer";
    }

    this.createAdUser = function(userItem)
    {
        userItem.activeDirectory = true;
        userItem.ldapDomainId = dbUtils.createId(userItem.ldapDomainId);
        if (userItem.groups){
            userItem.adgroups = userItem.groups;
        }
        userItem = baseCreate(userItem)
        userItem.active = true;
        return (toUserModel(userItem));
    };

    this.forgetPassword = function()
    {
        var expirationDate =  new Date();
        var now = new Date();
        expirationDate.setDate(expirationDate.getDate() + 7);
        var userItemTemplate =  {
            "changePasswordState":true,
            "pendingExpiration":  expirationDate,
            "lastUpdated": now
        };


        var  userCreated = userItemTemplate;
        return userCreated;
    };


    this.activateUser = function(userItem)
    {
        var now =  new Date();
        var userItemTemplate =  {
            "hash": userItem.password,
            "active":true,
            "lastUpdated": now,
            "lastLogin": now
        };

        var  userActivated = _.extend(userItemTemplate,userItem);
        delete userActivated['pendingExpiration'];
        delete userActivated['password'];
        delete userActivated['dashboardRule'];

        return userActivated;
    };


    this.recoverPasswordUser = function(userItem)
    {
        var now =  new Date();
        var userItemTemplate =  {
            "hash": userItem.password,
            "active":true,
            "lastUpdated": now,
            "lastLogin": now
        };

        var  userActivated = _.extend(userItemTemplate,userItem);
        delete userActivated['pendingExpiration'];
        delete userActivated['password'];
        delete userActivated['dashboardRule'];
        delete userActivated['changePasswordState'];

        return userActivated;
    };

    function removeUnnecessaryFields(userItem){
        var validFields = ['roleId', 'userName', 'firstName', 'lastName', 'principalName', 'objectSid', 'uSNChanged', 'email', 'active', 'lastLogin', 'activeDirectory', 'hash', 'cn', 'displayName', 'givenName', 'sn', 'groups', 'userPrincipalName'];
        return  _.pick(userItem, validFields);
    }

    this.update = function(userItem)
    {
        if(userItem.hash)
        {
            userItem.active = true;
        }
        userItem.lastUpdated = new Date();
        return toUserModel(userItem, true)
    }
}


userFactory.instance = null;

userFactory.getInstance = function(){
    if(this.instance === null){
        this.instance = new userFactory();
    }
    return this.instance;
};

module.exports = userFactory.getInstance();
