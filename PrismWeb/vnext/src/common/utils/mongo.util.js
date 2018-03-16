var Q           = require('q');
var _           = require('underscore');
var objectId    = require('mongodb').ObjectID;
var stringUtils = require('./string.util');
var dbUtils     = require('../dal/dbUtils');
var mongo = require('mongodb');
var mongoClient = mongo.MongoClient;
var env_config = require('config');
var AEScrypto = require('../security/AEScrypto');
var fs = require('fs');
var logger = require('../logger').default('mongo-util');

var knownSpecialObjectIDs = ['calendar'];

function mongoUtils() {
    var self = this;

    /**
     * sortAngPage - return the given collection sorted and cut by skip and limit params
     * string sort done case ignored.
     *
     * @param collection {array}
     * @param sort {object}
     * @param skip {number}
     * @param limit {number}
     * @returns {array}
     */
    this.sortAngPage = function(collection, sort, skip, limit){
        // validate
        if (!collection || collection.length === 0){
            return collection;
        }

        var result = collection;

        if (sort) {
            // Case the sort option is string
            if (_.isString(sort)) {
                // sort according to the field
                result = _.sortBy(result, sort);

                // reverse if desc
                if (sort[0] === '-') {
                    result = result.reverse();
                }
            } else {
                var sortFields = Object.keys(sort);
                if (sortFields.length > 0) {

                    // sort string ignoreCase
                    if (_.isString(result[0][sortFields[0]])) {

                        result = result.sort(function (a, b) {
                            var aField = a[sortFields[0]];
                            var bField = b[sortFields[0]];

                            if (!aField) aField = "";
                            if (!bField) bField     = "";

                            if (aField.toUpperCase() < bField.toUpperCase()) return -1 * sort[sortFields[0]];
                            if (aField.toUpperCase() > bField.toUpperCase()) return sort[sortFields[0]];
                            return 0;
                        });
                    }
                    // sort normally
                    else {
                        // sort
                        result = _.sortBy(result, sortFields[0]);

                        // reverse if desc
                        if (sort[sortFields[0]] === -1) {
                            result = _.chain(result).reverse().value();
                        }
                    }
                }
            }
        }

        if (skip) {
            result = _.rest(result, skip);
        }

        if (limit) {
            result = _.first(result, limit);
        }

        return result;
    };

    function convertStringToType(property, type, subType) {

        var convertedProperty;
        var convertedArray;

        if (typeof property !== 'string') {
            if (Array.isArray(property) && (type === 'array')) {
                convertedArray = property.map(function (element) {
                    return convertStringToType(element, subType);
                });
                return {$in: convertedArray};
            } else {
                return property;
            }
        }

        switch (type) {
            case 'objectId':
                if (property.toUpperCase() === 'NULL') {
                    convertedProperty = null;
                } else {
                    if (dbUtils.isObjectId(property)) {
                        convertedProperty = new objectId(property);
                    } else {
                        if (knownSpecialObjectIDs.indexOf(property) === -1) {
                            var nowString = new Date().toString();
                            logger.error(nowString, 'got unexpected ObjectID:', property);
                        }

                        convertedProperty = property;
                    }
                }
                break;
            case 'number':
                convertedProperty = parseInt(property);
                break;
            case 'array':
                convertedArray = property.split(/,(?![^[]*\])/).map(function (element) {
                    return convertStringToType(element, subType);
                });
                convertedProperty = {$in: convertedArray};
                break;
            default:
                convertedProperty = property;
        }

        return convertedProperty;
    }

    this.makeQueryInsensitive = function (query) {
        for (var property in query) {
            if (query.hasOwnProperty(property) && (typeof query[property] === 'string')) {
                query[property] = stringUtils.createCaseInsensitiveRegExp(query[property]);
            }
        }
    }

    this.parseUserQuery = function (userQuery, fieldsMapping) {
        var query = {}
        _.each(userQuery, function(value, key) {
            var propertyName = key.toString();
            if (propertyName === '$or') {
                //query.$or = self.parseUserQuery(userQuery.$or, fieldsMapping);
                query.$or = _.map(userQuery.$or, function(currQuery){
                    return self.parseUserQuery(currQuery, fieldsMapping);
                });
            } else {
                var mapping = _.findWhere(fieldsMapping, {queryStringName : propertyName});

                if(mapping) {
                    parsedValue = convertStringToType(value, mapping.type, mapping.subType);
                    query[mapping.mongoName] = parsedValue;
                }
                else {
                    query[key] = value;
                }
            }
        });

        return query;
    }

    this.convertToMongoObject = function(fields, modifier) {
        var object = {};

        _.each(fields, function(f) {
            var field = f;
            var order = 1;

            if (field.charAt(0) === '-') {
                field = field.slice(1);
                order = modifier;
            }

            object[field] = order;
        });

        return object;
    }

    this.wrapOrQuery = function(fieldsToWrap) {
        var orQuery = {};

        orQuery.$or = fieldsToWrap;

        return orQuery;
    };

    this.getDatabaseConnection = function(databaseName, username = env_config.db_security.mongoAppUser, password = env_config.db_security.mongoAppPassword) {
        var ReadPreference = mongo.ReadPreference;
        var host, port;
        var connectionString;

        if (env_config.replica_set && env_config.replica_set.name && env_config.replica_set.servers) {
            connectionString = (`mongodb://${username}:${AEScrypto.decrypt(password, env_config.db_security.mongoAppKey, env_config.db_security.mongoAppIV)}@`);
            env_config.replica_set.servers.forEach(function (replica) {
                connectionString = (`${connectionString}${replica.host}:${replica.port},`);
            });
            connectionString = connectionString.slice(0, -1);
            connectionString = (`${connectionString}/${databaseName}?replicaSet=${env_config.replica_set.name}`);

        } else {
            connectionString = (`mongodb://${username}:${AEScrypto.decrypt(password, env_config.db_security.mongoAppKey, env_config.db_security.mongoAppIV)}@${env_config.db_server.host}:${env_config.db_server.port}/${databaseName}`);
        }

        var opts = {
            db: {
                authSource: 'admin',
                slaveOk: true,
                readPreference: ReadPreference.PRIMARY_PREFERRED
            }
        }

        if (env_config.db_security.sslEnabled && typeof env_config.db_security.sslEnabled === 'boolean') {
            var cert = [fs.readFileSync(env_config.db_security.certFilePath)];
            var key = fs.readFileSync(env_config.db_security.pemKeyFilePath);

            opts.server = {
                ssl: env_config.db_security.sslEnabled,
                //sslValidate: env_config.db_security.sslValidate,
                sslKey: key,
                sslCert: cert,
                sslPass: env_config.db_security.pemKeyPassword
            };

            if (env_config.db_security.caFilePath) {
                opts.server.sslCA = [fs.readFileSync(env_config.db_security.caFilePath)];
            }
        }
        if(process.env.NODE_ENV !== 'production' && process.env.NODE_ENV !== 'test_ci' && process.env.NODE_ENV !== 'development'){ 
        // if(process.env.NODE_ENV !== 'production' && process.env.NODE_ENV !== 'test_ci'){
            connectionString = connectionString.slice(0, 10) + connectionString.slice(connectionString.indexOf("@") + 1, connectionString.length);
        }

        return mongoClient.connect(connectionString, opts).then(db => {
            return db;
        }).catch(err => {
            console.error('cant open connection to db ', err);
        });
    }

    this.changeMongoUserPassword = function (userName, password) {
        return self.getDatabaseConnection('admin').then(db => {
            return db.command({ updateUser: userName, pwd: password}).then(function(result) {
                db.close();
                if(result.ok){
                    return AEScrypto.encrypt(password, env_config.db_security.mongoAppKey, env_config.db_security.mongoAppIV);
                };
                console.log(`something went wrong`);
                return false;
            });
        }).catch((err) => {
            console.log(`Authentication Failed with user ${userName}`);
            console.log(err);
            return false;
        })
    }
}

mongoUtils.instance = null;

mongoUtils.getInstance = function(){
    if(this.instance === null){
        this.instance = new mongoUtils();
    }
    return this.instance;
};

module.exports = mongoUtils.getInstance();

