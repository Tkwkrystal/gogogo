/**
 * Created with JetBrains WebStorm.
 * User: a.elkayam
 * Date: 15/09/13
 * Time: 17:39
 * To change this template use File | Settings | File Templates.
 */
var ObjectID = require('mongodb').ObjectID;
var mongoConnection = require('../../common/dal/mongoConnection');
var env_config = require('config');
var promiseHandler =  require('../../common/promise');
var Q = require('q');
var mongoUtils = require('../../common/utils/mongo.util');
var stringUtils = require('../../common/utils/string.util');
var dbUtils = require('./../../common/dal/dbUtils');
var checkForHexRegExp = '^[0-9a-fA-F]{24}$';
var applicationError = require('../../common/errors/ApplicationErrors');
const logger = require('../../common/logger').default('users-dal');

function userMongo() {
    var collection = 'users';
    var self = this;

    var collectionName = 'users';

    var db = mongoConnection.get(env_config.db_prism.database);
    db.collection(collectionName, {}, function (err, collection) {
        if (!err)
        {
            collection.createIndex('firstName');
            collection.createIndex('lastName');
            collection.createIndex('userName');
            collection.createIndex('email');
            collection.createIndex({ groups: 1 }, { sparse: true });
        }
    });

    db.on('close', function(err) {
        logger.error('Connection to Mongo lost: %s', err);
    });


    this.getUserByQuery = function (query, done) {
        db.collection(collectionName, function (err, collection) {
            collection.findOne(query, function (err, user) {
                return done(err, user);
            });
        });
    };

    this.getUserByQueryPromise = function (query) {
        var deferred = Q.defer();

        self.getUserByQuery(query, function (err, user) {
            return err ? deferred.reject(err) : deferred.resolve(user);
        });

        return deferred.promise;
    };

    this.getUsersByQuery = function (query, done) {
        db.collection(collectionName, function (err, collection) {
            collection.find(query).toArray(function (err, users) {
                return done(err, users);
            });
        });
    };

    this.getUsersByQueryPromise = function (query) {
        var deferred = Q.defer();

        self.getUsersByQuery(query, function (err, user) {
            return err ? deferred.reject(err) : deferred.resolve(user);
        });

        return deferred.promise;
    };

    this.countUsersByRoles = function(){
        var groupBy = [{
                $group : {
                    _id : '$roleId',
                    count : {
                        $sum : 1
                    }
                }
            }];
        return Q.ninvoke(db, 'collection', collection)
        .then(function(collection){
            return Q.ninvoke(collection, 'aggregate', groupBy);
        });
    };


    //////////////////////////////////////////////////////////////////////////////

    /*
     findById
     */
    this.findById = function (userId, callback) {
        db.collection(collectionName, function (err, collection) {
            collection.findOne({'_id': new ObjectID(userId)},{ hash: 0 },
                function (err, item) {
                    return  callback(err, item);
                });
        });
    };

    /*
     findByIdUsername
     */
    this.findByIdUsername = function (user, done) {
        var query = { $or: [ { _id: user.match(checkForHexRegExp) ? new ObjectID(user) : user }, {'userName': { '$regex' :  '^' + stringUtils.escapeRegExp(user) + '$', '$options' : '-i' } } ] };
        db.collection(collectionName, function (err, collection) {
            collection.findOne(query, function (err, user) {
                return done(err, user);
            });
        });
    };
    /*
     findByEmail
     */
    this.findByEmail = function (email, callback) {
        db.collection(collectionName, function (err, collection) {
            collection.findOne({'email': email},
                function (err, item) {
            return  callback(err, item);
        });
    });
    };

    this.findByUserName = function (userName, callback) {
        db.collection(collectionName, function (err, collection) {
            collection.findOne({'userName': userName},
                function (err, item) {
            return  callback(err, item);
        });
    });
    };

//    /*
//     findAll
//     */
//    this.findAll = function (limit, skip, query,callback) {
//        db.collection(collectionName, function (err, collection) {
//            if (limit && skip) {
//                collection.find(query,{ hash: 0 }).limit(limit).skip(skip).toArray(function (err, items) {
//                    resultFunc(err, items);
//                });
//            } else {
//                if (limit) {
//                    collection.find(query,{ hash: 0 }).limit(limit).toArray(function (err, items) {
//                        resultFunc(err, items);
//                    });
//                } else {
//                    if (skip) {
//                        collection.find(query,{ hash: 0 }).skip(skip).toArray(function (err, items) {
//                            resultFunc(err, items);
//                        });
//                    } else {
//                        collection.find(query,{ hash: 0 }).toArray(function (err, items) {
//                            resultFunc(err, items);
//                        });
//                    }
//                }
//
//                function resultFunc(err, items) {
//                    if(callback)  callback(err, items);
//                }
//            }
//        });
//    };

    /*
     add operation
     */
    this.add = function (newUser, callback) {
        db.collection(collection, function (err, collection) {
            if(newUser.constructor == Array) {
                collection.insertMany(newUser, (err, result) => {if (callback) callback(err, result.ops);});
            }else{
                collection.insertOne(newUser, (err, result) => {if (callback) callback(err, result.ops);});
            }
        });
    };

    /*
     update operation
     */
    this.update = function (userId,userItem, callback, shouldUpdateAsIs) {
        delete userItem._id;
        var idObject = dbUtils.createId(userId);
        var query =  { '_id':idObject};

        var updateObject =  shouldUpdateAsIs ? userItem : {$set:userItem};

        db.collection(collection, function (err, collection) {
            collection.updateOne(query, updateObject, (err, result) => { if(callback) callback(err, [result.matchedCount, result]);});
        });
    };

    this.updateByIdUsername = function (user,userItem, callback) {
        var query = { $or: [ { _id: user.match(checkForHexRegExp) ? new ObjectID(user) : user }, {'userName': { '$regex' :  '^' + stringUtils.escapeRegExp(user) + '$', '$options' : '-i' } } ] };

        var updateObject =  {$set:userItem};

        db.collection(collection, function (err, collection) {
            collection.updateOne(query, updateObject, (err, result) => { if(callback) callback(err, [result.matchedCount, result]);});
        });
    };

    this.findByRoleId = function (roleId) {
        var query = {'roleId' : dbUtils.createId(roleId)};

        return Q.ninvoke(db, 'collection', collectionName)
        .then(function(collection){
            return Q.ninvoke(collection, 'find', query);
        }).then(function(results){
            return Q.ninvoke(results, 'toArray');
        });
    };

    this.updateWithQuery = function (query,updateObject, callback) {
        let updateObjectArray = undefined;

        // Fix bug with insert one object instead of array of object
        if(!updateObject["$set"]) {
            updateObjectArray = {"$set": updateObject};
        }

        db.collection(collection, function (err, collection) {
            collection.updateMany(query, updateObjectArray ? updateObjectArray : updateObject, (err, result) => {
                if(callback) callback(err, err ? undefined : [result.matchedCount, result]);
            });
        });
    };

    this.upsertWithQuery = function (query, updateObject) {
        return Q.ninvoke(db, 'collection', collectionName)
        .then(function(collection){
            return Q.ninvoke(collection, 'updateOne', query, updateObject, {upsert:true}).then((result) => [result.matchedCount, result]);
        });
    };

    /*
     delete operation
     */
    this.delete = function (userId, callback) {
        var query =  { '_id': new ObjectID(userId)};

        db.collection(collection, function (err, collection) {
            collection.deleteMany(query , (err, result) => callback(err, result.result.n));
        });
    };

    this.deleteByIdUsername = function (user, callback) {
        var query = { $or: [ { _id: user.match(checkForHexRegExp) ? new ObjectID(user) : user }, {'userName': { '$regex' :  '^' + stringUtils.escapeRegExp(user) + '$', '$options' : '-i' } } ] };

        db.collection(collection, function (err, collection) {
            collection.deleteMany(query ,(err, result) => {if(callback) callback(err, result.result.n);});
        });
    };

    /*
     delete operation
     */
    this.deleteByQuery = function (query, callback) {

        db.collection(collection, function (err, collection) {
            collection.deleteMany(query ,(err, result) => {if(callback) callback(err, result.result.n);});
        });
    };

    /*
     delete operation
     */
    this.deleteByGroupSid = function (groupSid, callback) {
        var query =  { 'adgroups': groupSid};

        db.collection(collection, function (err, collection) {
            collection.deleteMany(query ,(err, result) => {if(callback) callback(err, result.result.n);});
        });
    };

    /*
     count
     */
    this.count = function (query, callback, isPromise) {
        var deferredObj = Q.defer();

        db.collection(collectionName, function (err, collection) {
            //check for database error
            if (err) return promiseHandler.promiseCallback(callback,isPromise,deferredObj,new applicationError.Database(err),null);

            collection.count(query,function (err, result) {
                //check for database error
                if (err) return promiseHandler.promiseCallback(callback,isPromise,deferredObj,new applicationError.Database(err),null);


                var resultObj = {
                    'collection': collectionName,
                    'count': result
                };

                return promiseHandler.promiseCallback(callback,isPromise,deferredObj,null,resultObj);
            });
        });

        if(isPromise) return deferredObj.promise;
    };

    this.findAll = function (limit,skip,orderBy,query,callback, isPromise) {
        var deferredObj = Q.defer();

        db.collection(collectionName, function (err, collection) {

            collection.find(query).toArray(function (err, users) {

                if (err) return promiseHandler.promiseCallback(callback,isPromise,deferredObj,new applicationError.Database(err),null);

                users = mongoUtils.sortAngPage(users, orderBy, skip, limit);

                return promiseHandler.promiseCallback(callback,isPromise,deferredObj,null,users);
            });
        });

        if(isPromise) return deferredObj.promise;
    };

    this.findByGroupId = function (groupId, callback) {
        db.collection(collectionName, function (err, collection) {
            collection.find({ groups: groupId }).toArray(function (err, users) {
                return callback(err, users);
            });
        });
    };

    this.findByGroupSid = function (groupSid, callback) {
        db.collection(collectionName, function (err, collection) {
            collection.find({ adgroups: groupSid }).toArray(function (err, users) {
                return callback(err, users);
            });
        });
    };

    this.addGroup = function (userId, groupId, callback) {
        db.collection(collectionName, function (err, collection) {
            collection.updateOne({ '_id': new ObjectID(userId) }, { $push: { groups: groupId } }, (err, result) => callback(err, [result.matchedCount, result]));
        });
    };

    this.removeGroup = function (userId, groupId, callback) {
        db.collection(collectionName, function (err, collection) {
            collection.updateOne({ '_id': new ObjectID(userId) }, { $pull: { groups: groupId } }, (err, result) => callback(err, [result.matchedCount, result]));
        });
    };

    this.removeGroupToAll = function (groupId, callback) {
        db.collection(collectionName, function (err, collection) {
            collection.updateMany({ groups: groupId }, { $pull: { groups: groupId } }, (err, result) => callback(err, [result.matchedCount, result]));
        });
    };
}

userMongo.instance =  new userMongo();

userMongo.getInstance = function(){
    if(this.instance === null){
        this.instance = new userMongo();
    }
    return this.instance;
};


module.exports = userMongo.getInstance();
