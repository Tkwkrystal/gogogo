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
// var navverFactory = require('./navver.factory');
var userNavMongo = require('./userNav.dal');
var promiseHandler =  require('../../common/promise');
var Q = require('q');
var _ = require('underscore');
var objectID = require('mongodb').ObjectID;

function userNavService() {
    var self = this;
    this.addUsernavs = function(newUsernav,callback,isPromise)
    {
        var deferredObj = Q.defer();
        userNavMongo.add(newUsernav, function (err, result) {
            //check for database error
            if (err)  return promiseHandler.promiseCallback(callback,isPromise,deferredObj,new applicationError.Database(err),null);
            //send response
            return promiseHandler.promiseCallback(callback,isPromise,deferredObj,null,result);
        });

        if(isPromise) return deferredObj.promise;
    }
    
    this.getUsernavs = function(callback,isPromise)
    {
        var deferredObj = Q.defer();
        userNavMongo.findAll( function (err, item) {
            if (err)  return promiseHandler.promiseCallback(callback,isPromise,deferredObj,new applicationError.Database(err),null);
            if (!item)  return promiseHandler.promiseCallback(callback,isPromise,deferredObj,new applicationError.NotFound("usernav not found"),null);
            return promiseHandler.promiseCallback(callback,isPromise,deferredObj,null,item);
        });
        if(isPromise) return deferredObj.promise;
    };


    this.getUsernavByID=function(userID,callback,isPromise){
        var deferredObj = Q.defer();
        userNavMongo.findByUserID(userID, function (err, item) {
            if (err)  return promiseHandler.promiseCallback(callback,isPromise,deferredObj,new applicationError.Database(err),null);
            if (!item)  return promiseHandler.promiseCallback(callback,isPromise,deferredObj,new applicationError.NotFound("usernav not found"),null);
            return promiseHandler.promiseCallback(callback,isPromise,deferredObj,null,item);
        });
        if(isPromise) return deferredObj.promise;
    }

    this.updataUsernav=function(usernavID,updateObject,callback,isPromise){
                var deferredObj = Q.defer();
        updateObjects ={$addToSet:{"childList":updateObject}};
        userNavMongo.update(usernavID,updateObjects, function (err, result) {
            //check for database error
            if (err)  return promiseHandler.promiseCallback(callback,isPromise,deferredObj,new applicationError.Database(err),null);
            if(!result) return  promiseHandler.promiseCallback(callback,isPromise, new applicationError.NotFound('usernav not found'),null);
            return promiseHandler.promiseCallback(callback,isPromise,deferredObj,null,result);
        });
    }
}

userNavService.instance = null;

userNavService.getInstance = function(){
    if(this.instance === null){
        this.instance = new userNavService();
    }
    return this.instance;
}

module.exports = userNavService.getInstance();

