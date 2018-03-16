var objectID = require('mongodb').ObjectID;
var _ = require('underscore');
var Q = require('q');


function funAuthFactory()
{
    var self = this;   
    this.create = function(funAuthItem){    
        var newFunAuthItem = {
            "type":funAuthItem.type || undefined,
            "url":funAuthItem.url || undefined,
            "review": funAuthItem.review || uname,
            "founder" : getPropertyValueOrDefault(funAuthItem, ["givenName", "firstName"]),
            "create_time" : new Date(),
            "Isdisable" : funAuthItem.Isdisable  || undefined,
            "auths": funAuthItem.auths || undefined,
            // TODO: add more fields such as ssoToken/jti, ssoTokenIat, and more
        };
        return (newFunAuthItem);
    };
}


funAuthFactory.instance = null;

funAuthFactory.getInstance = function(){
    if(this.instance === null){
        this.instance = new funAuthFactory();
    }
    return this.instance;
};

module.exports = funAuthFactory.getInstance();
