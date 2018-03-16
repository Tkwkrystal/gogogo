var Q = require('q');
var _ = require('lodash');
var rolesSVC = require('../../roles/v1/roles.service');
var usersDal = require('./users.dal.v1.1');

module.exports = {
    getUsers: getUsers
};

function getUsers(userQuery, queryOptions) {
    // Convert roles to roleIds
    var updateQuery = Q.when(userQuery);
    if (userQuery.roles) {
        updateQuery = rolesSVC.getRoles(
            {name: {$in: userQuery.roles}},
            {fields: '_id'}
        )
        .then(function(roles) {
            var roleIds = _.map(roles, '_id');
            var newQuery = _.omit(userQuery, 'roles');
            newQuery.roleIds = roleIds;
            return newQuery;
        });
    }

    return updateQuery
        .then(function(updatedQuery) {
            return usersDal.getUsers(updatedQuery, queryOptions);
        });
}
