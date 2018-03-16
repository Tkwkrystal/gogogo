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
var navverMongo = require('./navver.dal');
var promiseHandler =  require('../../common/promise');
var Q = require('q');
var _ = require('underscore');
var objectID = require('mongodb').ObjectID;

function navverService() {
    var self = this;
    this.addNavvers = function(newNvavver,callback,isPromise)
    {
        var deferredObj = Q.defer();
        navverMongo.add(newNvavver, function (err, result) {
            //check for database error
            if (err)  return promiseHandler.promiseCallback(callback,isPromise,deferredObj,new applicationError.Database(err),null);
            //send response
            return promiseHandler.promiseCallback(callback,isPromise,deferredObj,null,result);
        });

        if(isPromise) return deferredObj.promise;
    }

    this.getNavvers = function(callback,isPromise)
    {
        var deferredObj = Q.defer();
        navverMongo.findAll( function (err, item) {
            if (err)  return promiseHandler.promiseCallback(callback,isPromise,deferredObj,new applicationError.Database(err),null);
            if (!item)  return promiseHandler.promiseCallback(callback,isPromise,deferredObj,new applicationError.NotFound("nav not found"),null);
            return promiseHandler.promiseCallback(callback,isPromise,deferredObj,null,item);
        });
        if(isPromise) return deferredObj.promise;
    };

    this.updataNavvers=function(treeNodesID,updateObject,callback,isPromise){
         var deferredObj = Q.defer();
        updateObjects ={"$set":{"treeNodes":updateObject}};
        navverMongo.update(treeNodesID,updateObjects, function (err, result) {
            //check for database error
            if (err)  return promiseHandler.promiseCallback(callback,isPromise,deferredObj,new applicationError.Database(err),null);
            if(!result) return  promiseHandler.promiseCallback(callback,isPromise, new applicationError.NotFound('nav not found'),null);
            return promiseHandler.promiseCallback(callback,isPromise,deferredObj,null,result);
        });
    }

    this.removeNavvers=function(callback,isPromise){
        var deferredObj = Q.defer();
       navverMongo.remove(function (err, result) {
           //check for database error
           if (err)  return promiseHandler.promiseCallback(callback,isPromise,deferredObj,new applicationError.Database(err),null);
           if(!result) return  promiseHandler.promiseCallback(callback,isPromise, new applicationError.NotFound('nav not found'),null);
           return promiseHandler.promiseCallback(callback,isPromise,deferredObj,null,result);
       });
   }
}

navverService.instance = null;

navverService.getInstance = function(){
    if(this.instance === null){
        this.instance = new navverService();
    }
    return this.instance;
}

module.exports = navverService.getInstance();

