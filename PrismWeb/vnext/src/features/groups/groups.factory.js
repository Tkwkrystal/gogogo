
var objectID        = require('mongodb').ObjectID;
var _               = require('underscore');
var Q               = require('q');
var dbUtils         = require('../../common/dal/dbUtils');
var roleReadService = require('../roles/roleRead.service');

function GroupFactory() {

    function verifyRoles(group) {
        if (!group.roleId){
            return Q.when(group);
        }
        // Check if the role is in the old format ({admin:false, contributor
        // :true, consumer : false})
        if (typeof group.roleId === "object" &&
            !dbUtils.isObjectId (group.roleId)){
            // Convert the role to the new format - roleId
            group.roleId = getRoleNameFromOldFormat(group.roleId);
        }

        return roleReadService.getRoleByIdOrName(group.roleId).
        then(function (role){
            group.roleId = role._id;
            return group;
        // If the role doesn't exist we set it to consumer
        }).catch(function (err){
            return roleReadService.getRoleByIdOrName('consumer')
            .then(function (consumerRole){
                group.roleId = consumerRole._id;
                return group;
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

    function toGroupModel(group, enforceVerify) {
        var now = new Date();
        var sid;
        group = group || {};

        return verifyRoles(group)
        .then(function (group){
            if (group.objectSid && _.isArray(group.objectSid)){
                sid = new Buffer(group.objectSid);
            }

            return {
                roleId:         group.roleId,
                name:           group.name        || group.cn || "",
                ad:             group.ad          || false,
                objectSid:      sid               || group.objectSid  || "",
                dn:             group.dn          || "",
                uSNChanged:     group.uSNChanged  || "",
                mail:           group.mail        || "",
                defaultRole:    group.defaultRole || "",
                created:        now,
                lastUpdated:    now,
                pageIndex:      group.pageIndex ,
                ldapDomainId:   group.ldapDomainId,
                language:       group.language
            };
        });

    }

    this.create = function(groupItem) {
        return toGroupModel(groupItem);
    };

    this.createAdmin = function(groupItem) {

        groupItem.roleId = "admin";
        return toGroupModel(groupItem);
    };

    this.createAdGroup = function(groupItem) {

        if (!groupItem.roleId){
            groupItem.roleId = "consumer";
        }
        groupItem.ldapDomainId = dbUtils.createId(groupItem.ldapDomainId);
        groupItem.ad = true;
        return toGroupModel(groupItem, true);
    };

    this.update = function(groupItem) {

        return verifyRoles(groupItem)
        .then(function (groupItem){
            if (groupItem.objectSid && _.isArray(groupItem.objectSid)){
                groupItem.objectSid = new Buffer(groupItem.objectSid);
            }

            groupItem.lastUpdated = new Date();
            return groupItem;
        });
    };
}


GroupFactory.instance = null;

GroupFactory.getInstance = function(){
    if(this.instance === null){
        this.instance = new GroupFactory();
    }
    return this.instance;
};

module.exports = GroupFactory.getInstance();
