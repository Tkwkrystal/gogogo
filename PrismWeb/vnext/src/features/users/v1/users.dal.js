var env_config      = require('config');
var _               = require('lodash');
var Q               = require('q');
var util            = require('util');
var objectId		= require('mongodb').ObjectID;
var BaseMongo       = require('../../../common/dal/baseMongo').BaseMongo;
var mongoConnection = require('../../../common/dal/mongoConnection');
var mongoUtils		= require('../../../common/utils/mongo.util');
var stringUtils		= require('../../../common/utils/string.util');
var dbUtils			= require('../../../common/dal/dbUtils');
const logger		= require('../../../common/logger').default('users-dal-v1');

var USERS_COLLECTION_NAME = 'users';

var UsersMongo = function() {
    var db = mongoConnection.get(env_config.db_prism.database);
    UsersMongo.super_.call(this, db, USERS_COLLECTION_NAME);
    this.type = 'usersMongo';
	this.mongoFieldsMapping = [
		{ queryStringName : 'groupId', mongoName : 'groups', type : 'string' },
		{ queryStringName : 'groupSid', mongoName : 'adgroups', type : 'string' },
		{ queryStringName : 'roleId', mongoName : 'roleId', type : 'objectId' },
		{ queryStringName : 'ids', mongoName : '_id', type : 'array', subType: 'objectId' },
		{ queryStringName : 'emails', mongoName : 'email', type : 'array', subType: 'string' },
		{ queryStringName : 'ldapDomainId', mongoName : 'ldapDomainId', type : 'objectId' },
		{ queryStringName : 'ldapDomainIds', mongoName : 'ldapDomainId', type : 'array', subType: 'objectId' }
	];

	logger.info('Connected to ' + USERS_COLLECTION_NAME + ' collection');

	this.addIndex('firstName');
	this.addIndex('lastName');
	this.addIndex('userName');
	this.addIndex('email');
	this.addIndex({ groups: 1 }, { sparse: true });

	this.db.on('close', function(err) {
		logger.error('Connection to Mongo lost: %s', err);
	});
};

util.inherits(UsersMongo, BaseMongo);

module.exports = new UsersMongo();

UsersMongo.prototype.getUsers = function(query, options) {
	var self = this;

	var _query = _.pick(query, ['userName','email','firstName','lastName','roleId','groupId','active',
								'origin','ids', 'emails', 'groupSid', 'ldapDomainId', 'ldapDomainIds','hash']);

	var filterArray = [];

	if (_query.origin) {
		var originFilter = {};

		userOrigin = _query.origin.toLowerCase();
		delete _query.origin;

		if (userOrigin === 'ad') {
			originFilter.activeDirectory = true;
		} else if (userOrigin === 'sisense') {
			originFilter.activeDirectory = {$ne: true};
		} else {
			//
			return Q.when([]);
		}

		filterArray.push(originFilter);
	}

	if (_query.groupId) {
		var groupFilter = {};

		groupId = _query.groupId;
		delete _query.groupId;

		if (dbUtils.isObjectId(groupId)) {
			groupFilter.groups = groupId;
		} else if (groupId.toLowerCase() === 'null') {
			groupFilter = {$or: [
				{groups: {$exists: false}},
				{groups: {$size: 0}}
			]};

		} else {

		}

		filterArray.push(groupFilter);
	}

	// Parsing the user friendly field names to their mongo equivalent
	mongoQuery = mongoUtils.parseUserQuery(_query, this.mongoFieldsMapping);
	mongoUtils.makeQueryInsensitive(mongoQuery);

	if (!_.isEmpty(mongoQuery)) {
		filterArray.push(mongoQuery);
	}

	var fullQuery = _.isEmpty(filterArray) ? {} : {$and: filterArray};

    return UsersMongo.super_.prototype.find.call(self, fullQuery, options);
};

UsersMongo.prototype.getUserById = function(userId, options) {
	var self = this;
	var query = { _id : dbUtils.createId(userId) };

    return UsersMongo.super_.prototype.findOne.call(self, query, options);
};

UsersMongo.prototype.addUsers = function(users) {
	var self = this;
    return UsersMongo.super_.prototype.add.call(self, users);
};

UsersMongo.prototype.updateUser = function(userId, user, isPartial) {
	var self = this;
	var query = { _id : dbUtils.createId(userId) };

	if (isPartial) {
		user = { $set : user };
	}

    return UsersMongo.super_.prototype.findAndUpdate.call(self, query, user).then(function(result) {
    	if (result) {
    		return result[0];
    	}
    	else {
    		return result;
    	}
    });
};

UsersMongo.prototype.checkExistence = function(users, exclutionIds, ad) {
	self = this;

	var queryArray = [];
	var adQueryArray = [];
	exclutionIds = exclutionIds || [];

	users.forEach(function (user) {
		if (user.email) {
			queryArray.push(stringUtils.createCaseInsensitiveRegExp(user.email));
		}

		if (user.userName) {
			queryArray.push(stringUtils.createCaseInsensitiveRegExp(user.userName));
		}

		if (ad) {
			var innerOrQuery = [];

			if (user.userName) innerOrQuery.push({'userName': stringUtils.createCaseInsensitiveRegExp(user.userName)});
			if (user.principalName) innerOrQuery.push({'principalName': stringUtils.createCaseInsensitiveRegExp(user.principalName)});
			if (user.objectSid) innerOrQuery.push({'objectSid': user.objectSid});

			if (innerOrQuery.length > 0) adQueryArray.push({activeDirectory: true, ldapDomainId: dbUtils.createId(user.ldapDomainId), $or: innerOrQuery});
		}
	});

	var query;

	if (ad) {
		query = {$or: [{$or : adQueryArray}, {email: {$in: queryArray}}], _id : { $nin : exclutionIds }};
	} else {
		query = {$or: [{userName: {$in: queryArray}, activeDirectory: {$ne: true}}, {email: {$in: queryArray}}], _id : { $nin : exclutionIds }};
	}

	return UsersMongo.super_.prototype.find.call(self, query);
};

UsersMongo.prototype.deleteUsers = function(usersIds) {
	var self = this;
	var query = {_id: {$in: usersIds.map(function (userId) {
		return dbUtils.createId(userId);
	})}};
    return UsersMongo.super_.prototype.delete.call(self, query);
 };

 UsersMongo.prototype.getUsersByEmailOrUsernameIgnoreCase = function (user) {
    var self = this;

    var _user = stringUtils.createCaseInsensitiveRegExp(user);
    var query = {$or: [{userName: _user}, {email: _user}]};

    return UsersMongo.super_.prototype.find.call(self, query);
};
