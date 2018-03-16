var applicationError = require('../../common/errors/ApplicationErrors');
var funAuthFactory = require('./funAuth.factroy');
var funAuthMongo = require('./funAuth.dal');
var promiseHandler =  require('../../common/promise');
var Q = require('q');
var _ = require('underscore');
var objectID = require('mongodb').ObjectID;

function funAuthService() {
    var self = this;
    this.addfunAuth = function(newfunAuth,callback,isPromise)
    {
        // var funAuth=funAuthFactory.create(newfunAuth);
        var deferredObj = Q.defer();
        funAuthMongo.add(newfunAuth, function (err, result) {
            if (err)  return promiseHandler.promiseCallback(callback,isPromise,deferredObj,new applicationError.Database(err),null);
            return promiseHandler.promiseCallback(callback,isPromise,deferredObj,null,result);
        });
        if(isPromise) return deferredObj.promise;
    };
    this.getfunAuths = function(callback,isPromise)
    {
        var deferredObj = Q.defer();
        funAuthMongo.findAll( function (err, item) {
            if (err)  return promiseHandler.promiseCallback(callback,isPromise,deferredObj,new applicationError.Database(err),null);
            if (!item)  return promiseHandler.promiseCallback(callback,isPromise,deferredObj,new applicationError.NotFound("nav not found"),null);
            return promiseHandler.promiseCallback(callback,isPromise,deferredObj,null,item);
        });
        if(isPromise) return deferredObj.promise;
    };
    this.updataFunAuth = function(id,updataObj,callback,isPromise)
    {
        var deferredObj = Q.defer();
        var updataObjs={"$set":{"title":updataObj.title,"nav_type":updataObj.nav_type,"url":updataObj.url,"code":updataObj.code,"create_time":updataObj.create_time}}
        funAuthMongo.updata(id,updataObjs, function (err, item) {
            if (err)  return promiseHandler.promiseCallback(callback,isPromise,deferredObj,new applicationError.Database(err),null);
            if (!item)  return promiseHandler.promiseCallback(callback,isPromise,deferredObj,new applicationError.NotFound("nav not found"),null);
            return promiseHandler.promiseCallback(callback,isPromise,deferredObj,null,item);
        });
        if(isPromise) return deferredObj.promise;
    };
    this.deleteFunAuth = function(id,callback,isPromise)
    {
        var deferredObj = Q.defer();
        funAuthMongo.delete(id, function (err, item) {
            if (err)  return promiseHandler.promiseCallback(callback,isPromise,deferredObj,new applicationError.Database(err),null);
            if (!item)  return promiseHandler.promiseCallback(callback,isPromise,deferredObj,new applicationError.NotFound("nav not found"),null);
            return promiseHandler.promiseCallback(callback,isPromise,deferredObj,null,item);
        });
        if(isPromise) return deferredObj.promise;
    };
}

funAuthService.instance = null;

funAuthService.getInstance = function(){
    if(this.instance === null){
        this.instance = new funAuthService();
    }
    return this.instance;
}

module.exports = funAuthService.getInstance();

