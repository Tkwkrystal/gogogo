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

var applicationError = require('../../common/errors/ApplicationErrors');
var userService = require('./users.service');
var groupService = require('../groups/groups.service');
var objectID = require('mongodb').ObjectID;
var Q = require('q');
var _ = require('underscore');

function userGroupService() {
    var self = this;

    var extendUsers = function (userIds, shares) {
        var deferredObj = Q.defer();
        var query = {_id: {$in: userIds}};

        userService.findByQuery(null, null, query, {})
            .then(function (userItems) {

                var sharesJoin = _.map(shares, function (item) {

                    var joinObject = _.find(userItems, function (user) { return item.shareId && user._id.equals(item.shareId); });

                    if (!joinObject) {
                        return undefined;
                    }

                    var destObj = {
                        email: joinObject.email,
                        userName: joinObject.userName,
                        firstName: joinObject.firstName,
                        lastName: joinObject.lastName,
                        active: joinObject.active,
                        roleId: joinObject.roleId,
                        baseRoleName: joinObject.baseRoleName,
                        roleName: joinObject.roleName
                    };

                    if (joinObject.activationToken) {
                        destObj.activationToken = joinObject.activationToken;
                    }

                    return _.extend(destObj, item);
                });
                sharesJoin = _.compact(sharesJoin);

                deferredObj.resolve(sharesJoin);

            })
            .catch(function (err) {
                deferredObj.reject(err);
            });

        return deferredObj.promise;
    };

    var extendGroups = function (groupIds, shares) {
        var deferredObj = Q.defer();
        var DO_USERS_COUNT = true;
        var ids = _.map(groupIds, function(x){ return x.toHexString(); });

        groupService.findByIds(ids, DO_USERS_COUNT, function (err, groupItems) {
            //check for database error
            if (err){
                deferredObj.reject(err);
            }

            var sharesJoin = _.map(shares, function (item) {

                var joinObject = _.find(groupItems, function (group) { return item.shareId && group._id.equals(item.shareId); });

                if (!joinObject) {
                    return undefined;
                }

                return _.extend(joinObject, item);
            });
            sharesJoin = _.compact(sharesJoin);

            deferredObj.resolve(sharesJoin);
        });

        return deferredObj.promise;
    };

    this.extendShareId = function(shares, callback) {
        var userIds = [];
        var groupIds = [];

        if(!shares || shares.length === 0) {
            return callback(null,userIds);
        }

        for (var i = 0; i < shares.length; i++) {
            var shareItem = shares[i];

            // validate
            if(!shareItem.shareId){
                continue;
            }

            if (shareItem.type == 'user') {
                userIds.push(shareItem.shareId);

            } else if (shareItem.type == 'group') {
                groupIds.push(shareItem.shareId);
            }
        }

        var promises = [];
        promises.push(extendUsers(userIds, shares));
        promises.push(extendGroups(groupIds, shares));

        Q.all(promises)
            .then(function(extendedArrays) {
                var allSharesItems = _.flatten(extendedArrays, true);
                callback(null, allSharesItems);
            },
            function(rej) {
                callback(rej, null);
            })
            .fail(function(err) {
                callback(err, null);
            });
    };



}

userGroupService.instance = null;

userGroupService.getInstance = function(){
    if(this.instance === null){
        this.instance = new userGroupService();
    }
    return this.instance;
}

module.exports = userGroupService.getInstance();

