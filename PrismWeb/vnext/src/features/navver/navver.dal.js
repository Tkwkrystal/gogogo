/**
 * Created with JetBrains WebStorm.
 * User: a.elkayam
 * Date: 15/09/13
 * Time: 17:39
 * To change this template use File | Settings | File Templates.
 */
var mongo = require('mongodb');
var mongoConnection = require('../../common/dal/mongoConnection');
var dbUtils = require('./../../common/dal/dbUtils');
var env_config = require('config');
var promiseHandler =  require('../../common/promise');
var Q = require('q');
// var ObjectID=require('mongodb').ObjectID;

function navverMongo() {
    var collection = 'navver';

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
    this.add = function (newNavver, callback) {
        db.collection(collection, function (err, collection) {
            collection.insert(newNavver, {safe: true}, function (err, result)
            {
                if(callback) callback(err, result);

            });
        });
    };

    /*
     findById
     */

    this.findAll = function (callback) {
        db.collection(collectionName, function (err, collection) {
            collection.find().toArray(function (err, items) {
                    return callback(err, items);
                });
        });
    };

    this.update = function (navID,updateObject, callback) {
        // delete updateObject._id;
        // var idObject = new BSON.ObjectID(navID);
        var idObject = dbUtils.createId(navID);
        var query =  { '_id':idObject};
        // var query =  { '_id':new BSON.ObjectID(navID)};

        db.collection(collection, function (err, collection) {
            collection.update(query, updateObject, {safe: true},
                function (err, result) {
                    callback(err, result);
                });
        });
    }

    this.remove = function (callback) {
        db.collection(collectionName, function (err, collection) {
            collection.remove();
            callback(err, {'data':"ok"});
        });
    };
}

navverMongo.instance =  new navverMongo();

navverMongo.getInstance = function(){
    if(this.instance === null){
        this.instance = new navverMongo();

    }
    return this.instance;
};

module.exports = navverMongo.getInstance();

