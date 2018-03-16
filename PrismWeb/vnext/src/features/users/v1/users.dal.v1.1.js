var env_config = require('config');
var _ = require('lodash');
var util = require('util');
var BaseMongo = require('../../../common/dal/baseMongo').BaseMongo;
var mongoConnection = require('../../../common/dal/mongoConnection');
var dbUtils = require('../../../common/dal/dbUtils');
const logger = require('../../../common/logger').default('users-dal-v1-1');

var USERS_COLLECTION_NAME = 'users';

var UsersMongo = function() {
    var db = mongoConnection.get(env_config.db_prism.database);
    UsersMongo.super_.call(this, db, USERS_COLLECTION_NAME);
    this.type = 'usersMongo';
    logger.info('Connected to ' + USERS_COLLECTION_NAME + ' collection');

    this.addIndex({
        groups: 1
    }, {
        sparse: true
    });

    this.db.on('close', function(err) {
        logger.error('Connection to Mongo lost: %s', err);
    });
};

util.inherits(UsersMongo, BaseMongo);

module.exports = new UsersMongo();

UsersMongo.prototype.getUsers = function(query, options) {
    query = _.pick(query, ['ids', 'groups', 'adgroups', 'roleIds']);
    var filters = [];

    if (query.ids) {
        query.ids = query.ids.map(dbUtils.createId);
        filters.push({'_id': {$in: query.ids}});
    }

    if (query.groups) {
        // User groups are strings
        var idsAsStrings = query.groups.map(function(objId) {
            return objId.toString();
        });
        filters.push({groups: {$in: idsAsStrings}});
    }

    if (query.adgroups) {
        filters.push({adgroups: {$in: query.adgroups}});
    }

    if (query.roleIds) {
        filters.push({roleId: {$in: query.roleIds}});
    }

    // $or between the filters
    var dbQuery = (filters.length) ? {$or: filters} : {};

    return this.find(dbQuery, options);
};
