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
var authConfigMongo = require('./authConfig.dal');
var promiseHandler =  require('../../common/promise');
var Q = require('q');
var _ = require('underscore');
var objectID = require('mongodb').ObjectID;

function authConfigService() {
    var self = this;
    this.addauthConfig = function(newauthConfig,callback,isPromise)
    {
        var deferredObj = Q.defer();
        authConfigMongo.add(newauthConfig, function (err, result) {
            //check for database error
            if (err)  return promiseHandler.promiseCallback(callback,isPromise,deferredObj,new applicationError.Database(err),null);
            //send response
            return promiseHandler.promiseCallback(callback,isPromise,deferredObj,null,result);
        });

        if(isPromise) return deferredObj.promise;
    }
    
    this.getAuthConfig = function(callback,isPromise)
    {
        var deferredObj = Q.defer();
        authConfigMongo.findAll( function (err, item) {
            if (err)  return promiseHandler.promiseCallback(callback,isPromise,deferredObj,new applicationError.Database(err),null);
            if (!item)  return promiseHandler.promiseCallback(callback,isPromise,deferredObj,new applicationError.NotFound("nav not found"),null);
            return promiseHandler.promiseCallback(callback,isPromise,deferredObj,null,item);
        });
        if(isPromise) return deferredObj.promise;
    };


    // this.getNavversByID=function(userID,callback,isPromise){
    //     var deferredObj = Q.defer();
    //     conmentMongo.findByUserID(userID, function (err, item) {
    //         if (err)  return promiseHandler.promiseCallback(callback,isPromise,deferredObj,new applicationError.Database(err),null);
    //         if (!item)  return promiseHandler.promiseCallback(callback,isPromise,deferredObj,new applicationError.NotFound("nav not found"),null);
    //         return promiseHandler.promiseCallback(callback,isPromise,deferredObj,null,item);
    //     });
    //     if(isPromise) return deferredObj.promise;
    // }

    // this.updataNavvers=function(navID,updateObject,callback,isPromise){
    //             var deferredObj = Q.defer();
    //     updateObjects ={$addToSet:{"childList":updateObject}};
    //     conmentMongo.update(navID,updateObjects, function (err, result) {
    //         //check for database error
    //         if (err)  return promiseHandler.promiseCallback(callback,isPromise,deferredObj,new applicationError.Database(err),null);
    //         if(!result) return  promiseHandler.promiseCallback(callback,isPromise, new applicationError.NotFound('nav not found'),null);
    //         return promiseHandler.promiseCallback(callback,isPromise,deferredObj,null,result);
    //     });
    // }
    // this.getNavvers=function(callback,isPromise)
    // {
    //     var deferredObj = Q.defer();
    //     navverMongo.findAll(function (err, result) {
    //         //check for database error
    //         if (err)  return promiseHandler.promiseCallback(callback,isPromise,deferredObj,new applicationError.Database(err),null);
    //         //send response
    //         return promiseHandler.promiseCallback(callback,isPromise,deferredObj,null,result);
    //     });

    //     if(isPromise) return deferredObj.promise;
    // }
}

authConfigService.instance = null;

authConfigService.getInstance = function(){
    if(this.instance === null){
        this.instance = new authConfigService();
    }
    return this.instance;
}

module.exports = authConfigService.getInstance();

