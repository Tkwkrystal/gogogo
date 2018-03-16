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
var Q = require('q');

function userNavMongo() {
    var collection = 'userNav';

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
    this.findById = function (navID, callback) {
        db.collection(collectionName, function (err, collection) {
            collection.findOne({'_id': new BSON.ObjectID(navID)},
                function (err, item) {
                    return  callback(err, item);
                });
        });
    };

    this.findByUserID = function (UserID,callback) {
        db.collection(collectionName, function (err, collection) {
            collection.find({ "userID": UserID }).toArray(function (err, items) {
                return callback(err, items);
            });
        });
    };

    this.update = function (navID,updateObject, callback) {
        var idObject = new BSON.ObjectID(navID);
        var query =  { '_id':new BSON.ObjectID(navID)};

        db.collection(collection, function (err, collection) {
            collection.update(query, updateObject, {safe: true},
                function (err, result) {
                    callback(err, result);
                });
        });
    }

    this.delete = function (navId, callback) {
        var query =  { '_id': new BSON.ObjectID(navId)};
        db.collection(collection, function (err, collection) {
            collection.remove(query ,{safe: true}, function (err, result) {
                if(callback) callback(err, result);
            });
        });
    }
}

userNavMongo.instance =  new userNavMongo();

userNavMongo.getInstance = function(){
    if(this.instance === null){
        this.instance = new userNavMongo();

    }
    return this.instance; 
};

module.exports = userNavMongo.getInstance();

