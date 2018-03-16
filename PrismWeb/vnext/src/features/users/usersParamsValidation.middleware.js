/**
 * Created with JetBrains WebStorm.
 * User: a.elkayam
 * Date: 03/10/13
 * Time: 13:50
 * To change this template use File | Settings | File Templates.
 */

var env_config = require('config');
var _ = require('underscore');
var objectID = require('mongodb').ObjectID;
var validator = require('../../common/utils/validator.util');

var applicationError = require('../../common/errors/ApplicationErrors');
var server = require('../../common/server');
var application = require('../../common/application');
//const
var checkForHexRegExp = "^[0-9a-fA-F]{24}$";
var readOnlyFields = ['_id', 'salt','created', 'lastUpdated', 'ldapDomainId'];
var readOnlyCreatedFields = ['_id', 'salt','created', 'lastUpdated'];
var requiredFields = ['userName'];

function userValidation (){

    this.getUsers = function (req, res, next) {
        var limit = req.query["limit"] ? parseInt(req.query["limit"]) : null;
        var skip = req.query["skip"] ? parseInt(req.query["skip"]) : null;

        if(isNaN(limit)) return server.error(res, new applicationError.Arguments('limit argument must be int'));
        if(isNaN(skip)) return server.error(res, new applicationError.Arguments('skip argument must be int'));

        return next();
    }

    this.count = function (req, res, next) {
        return next();
    }


    this.simulate = function (req, res, next) {
        if(!req.body)  return server.error(res, new applicationError.Arguments('request does not contain posted user'));

        //check readOnly fields validation
        var addedUser = req.body;
        // if multiple add
        if(!(addedUser instanceof Array)) return server.error(res, new applicationError.Arguments("wrong json format - must br as array"));

        var admode = req.query["admode"] === "true";

        return next();
    }

    this.validateEmails = function (req, res, next) {
        if(!req.body)  return server.error(res, new applicationError.Arguments('request does not contain posted emails'));

        //check readOnly fields validation
        var emails = req.body;
        // if multiple add
        if(!(emails instanceof Array)) return server.error(res, new applicationError.Arguments("wrong json format - must br as array"));

        for (var i = 0; i < req.body.length; i++) {
            var email = req.body[i];

            if(!email || !validator.validEmail(email)) return server.error(res, new applicationError.Arguments('email not validated :' + email));
        }

        return next();
    }


    this.findByIdUsername = function (req, res, next) {
        if(!req.params.user) return server.error(res, new applicationError.Arguments('request does not contain user Id or Username'));

        return next();
    }

    this.findByIds = function (req, res, next) {
        var idsList = req.body;

        if (!(idsList instanceof Array)) return server.error(res, new applicationError.Arguments('request does not contain List of Ids as Array'));

        for (var i = 0; i < idsList.length; i++) {
            if (!idsList[i].match(checkForHexRegExp)) return server.error(res, new applicationError.NotFound('one or more user Ids not valid'));
        }

        return next();
    };

    this.getLoggedInUser = function (req, res, next) {

        return next();
    }

    this.addUser = function (req, res, next) {
        if(!req.body)  return server.error(res, new applicationError.Arguments('request does not contain posted user'));

        //check readOnly fields validation
        var addedUser = req.body;
        // if multiple add
        if(!(addedUser instanceof Array)) return server.error(res, new applicationError.Arguments("wrong json format - must br as array"));

        for (var i = 0; i < req.body.length; i++) {
            var item = req.body[i];
            var selected = [Object.keys(item), readOnlyCreatedFields];
            var selectedIntersection = _.intersection.apply(_, selected);
            if (selectedIntersection.length > 0) return server.error(res, new applicationError.Arguments('the fields :' + selectedIntersection + 'can not be updated'));
            if(item.email&& !validator.validEmail(item.email)) return server.error(res, new applicationError.Arguments('email not validated :' + item.email));
        }

        return next();

        /*
         var selected = [Object.keys(addedUser), readOnlyCreatedFields];
         var selectedIntersection = _.intersection.apply(_, selected);
         if (selectedIntersection.length > 0) return server.error(res, new applicationError.Arguments('the fields :' + selectedIntersection + 'can not be updated'));

         //todo: check email validation
         return next();
         */
    }

    this.inviteUser = function (req, res, next) {
        if(!req.body)  return server.error(res, new applicationError.Arguments('request does not contain posted user'));
        // if multiple invite
        if(!(req.body instanceof Array)) return server.error(res, new applicationError.Arguments("wrong json format - must br as array"));


        req.body.forEach(function(item){  if(!item.email)
            return server.error(res, new applicationError.Arguments('invited user item does not contain email'));
            if(item.email&& !validator.validEmail(item.email)) return server.error(res, new applicationError.Arguments('email not validated :' + item.email));
        })
        return next();


    }

    this.activateUser = function (req, res, next) {
        if(!req.body)  return server.error(res, new applicationError.Arguments('request does not contain posted user'));

        if(!req.body.password) return server.error(res, new applicationError.Arguments('request does not contain password'));
        if(!req.params.user) return server.error(res, new applicationError.Arguments('request does not contain user Id or userName'));

        //check readOnly fields validation
        var addedUser = req.body;
        var selected = [Object.keys(addedUser), readOnlyCreatedFields];
        var selectedIntersection = _.intersection.apply(_, selected);
        if (selectedIntersection.length > 0) return server.error(res, new applicationError.Arguments('the fields :' + selectedIntersection + 'can not be updated'));

        //todo: check email validation
        return next();
    }

    this.recoverPassword = function (req, res, next) {

        if(!req.body){

            return server.error(res, new applicationError.Arguments('request does not contain posted user'));

        }
        else if(!req.body.password){

            return server.error(res, new applicationError.Arguments('request does not contain password'));
        }
        else
        {                //check readOnly fields validation
                var addedUser = req.body,
                    selected = [Object.keys(addedUser), readOnlyCreatedFields],
                    selectedIntersection = _.intersection.apply(_, selected);

                if (selectedIntersection.length > 0) {

                    return server.error(res, new applicationError.Arguments('the fields :' + selectedIntersection + 'can not be updated'));
                }

                //todo: check email validation
                return next();

        }

    }

    this.forgetPassword = function (req, res, next) {
        if(!req.body)  return server.error(res, new applicationError.Arguments('request does not contain posted user'));
        if(!req.body.email) return server.error(res, new applicationError.Arguments('request does not contain email'));

        //todo: check email validation
        return next();
    }

    this.updateUser = function (req, res, next) {
        if(!req.params.user) return server.error(res, new applicationError.Arguments('request does not contain Id or Username'));
        if(!req.body)  return server.error(res, new applicationError.Arguments('request does not contain posted user'));

        //check readOnly fields validation
        var updateUser = req.body;
        var selected = [Object.keys(updateUser), readOnlyFields];
        var selectedIntersection = _.intersection.apply(_, selected);
        if (selectedIntersection.length > 0) return server.error(res, new applicationError.Arguments('the fields :' + selectedIntersection + ' can not be updated'));

        if(updateUser.email&& !validator.validEmail(updateUser.email)) return server.error(res, new applicationError.Arguments('email not validated :' + updateUser.email));
        return next();
    }

    this.deleteUser = function (req, res, next) {
        if(!req.params.user) return server.error(res, new applicationError.Arguments('request does not contain user Id of Username'));

        return next();
    }

    this.deleteUsers = function (req, res, next) {

        if(!req.body)  return server.error(res, new applicationError.Arguments('request does not contain posted user'));
        var ids = req.body;

        ids.forEach(function(item){ if (!item.match(checkForHexRegExp)) return server.error(res, new applicationError.NotFound('user Id not valid'));})

        return next();
    }
}


userValidation.instance = null;

userValidation.getInstance = function(){
    if(this.instance === null){
        this.instance = new userValidation();
    }
    return this.instance;
}


module.exports = userValidation.getInstance();