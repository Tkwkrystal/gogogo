/**
 * Created with JetBrains WebStorm.
 * User: a.elkayam
 * Date: 15/09/13
 * Time: 17:39
 * To change this template use File | Settings | File Templates.
 */
var mongo = require('mongodb');
var mongoConnection = require('../../common/dal/mongoConnection');
var env_config = require('config');
var promiseHandler =  require('../../common/promise');
var dbUtils = require('./../../common/dal/dbUtils');
var Q = require('q');
var ObjectID = require('mongodb').ObjectID;

function funAuthMongo() {
    var collection = 'funAuth';

    var collectionName = collection;
    var BSON = mongo.BSONPure;

    var db = mongoConnection.get(env_config.db_prism.database);
    console.log("Connected to " + collection + " collection");
    db.collection(collectionName, {}, function (err, collection) {
        if (!err) 
        {
            collection.ensureIndex("userId",function(err,item){});
        }
    });
    /*
     findById
     */
    this.add = function (newAuth, callback) {
        db.collection(collection, function (err, collection) {
            collection.insert(newAuth, {safe: true}, function (err, result)
            {
                if(callback) callback(err, result);

            });
        });
    };
    this.findAll = function (callback) {
        db.collection(collectionName, function (err, collection) {
            collection.find().toArray(function (err, items) {
                    return callback(err, items);
                });
        });
    };
    this.updata = function (id,obj,callback) {
        var idObject = dbUtils.createId(id);
        var query =  { '_id':idObject};
        db.collection(collectionName, function (err, collection) {
            collection.update(query, obj, {safe: true},function (err, items) {
                    return callback(err, items);
                });
        });
    };
    this.delete = function (userId, callback) {
        var query =  { '_id': new ObjectID(userId)};

        db.collection(collection, function (err, collection) {
            collection.deleteMany(query , (err, result) => callback(err, result.result.n));
        });
    };

}

funAuthMongo.instance =  new funAuthMongo();

funAuthMongo.getInstance = function(){
    if(this.instance === null){
        this.instance = new funAuthMongo();

    }
    return this.instance;
};

module.exports = funAuthMongo.getInstance();

