/**
 * Created with JetBrains WebStorm.
 * User: a.elkayam
 * Date: 15/09/13
 * Time: 14:18
 * To change this template use File | Settings | File Templates.
 */

var proxyService = require('../../common/middlewares/proxyService.middleware');
var userRulesValidation = require('./usersRulesValidation.middleware');
var userParamsValidation = require('./usersParamsValidation.middleware');
var userController = require('./users.controller');
var userModel = require("./users.document");
var env_config = require('config');
var apiAuthorization = require('../../common/middlewares/apiAuthorization.middleware');
var sw = require('swagger-node-express');
var param = require('../../common/paramTypes');
var swe = sw.errors;

module.exports = function(app,swagger) {


    this.app = app;
    this.swagger = swagger;

    /**
     * init the module
     **/
    this.init = function() {
        this.registerRoutes();
    };

    /**
     * routing's
     **/
    this.registerRoutes = function() {
        // forget password
        app.post('/users/forgetpassword', [ userParamsValidation.forgetPassword],userController.forgetPassword);
        //Retrieve all users
        app.get('/users',[apiAuthorization.validate, apiAuthorization.validatePermission("manage/users/get"), userParamsValidation.getUsers], userController.getAll);
        //Retrieve AD users from AD
        app.get('/users/ad',[apiAuthorization.validate, apiAuthorization.validatePermission("manage/users/get"),userParamsValidation.getUsers], userController.getAdUsers);
        //Retrieve users from all directories
        app.get('/users/allDirectories',[apiAuthorization.validate, apiAuthorization.validatePermission("manage/users/get"), userParamsValidation.getUsers], userController.getAllDirectoriesUsers);
        //Count all users
        app.get('/users/count',[apiAuthorization.validate, apiAuthorization.validatePermission("manage/users/get"), userParamsValidation.count], userController.count);
        //Retrieve the logged in user
        app.get('/users/loggedin', [apiAuthorization.validate,userParamsValidation.getLoggedInUser],userController.getLoggedInUser);
        //Retrieve the user with the specified _id
        app.get('/users/:user', [], userController.findByIdUsername);
        //Retrieve list of users with the specified _ids
        app.post('/users/byIds',[ apiAuthorization.validate, apiAuthorization.validatePermission("manage/users/get"), userParamsValidation.findByIds], userController.findByIds);
        // Add a new user
        app.post('/users', [ apiAuthorization.validate, apiAuthorization.validatePermission("manage/users/add"),userParamsValidation.addUser,userRulesValidation.addUser.bind(null, false)],userController.addUser);
        // Add active directory  user
        app.post('/users/ad', [ apiAuthorization.validate, apiAuthorization.validatePermission("manage/users/add"),userParamsValidation.addUser, userRulesValidation.addUser.bind(null, true)],userController.addAdUser);
        // Verify super user
        app.post('/users/super', userController.verifySuperUser);
        //Update User with the specified _id
        app.put('/users/:user', [ apiAuthorization.validate, apiAuthorization.validatePermission("manage/users/modify"),userParamsValidation.updateUser,userRulesValidation.updateUser],userController.updateUser);
        //Delete the User with the specified _id
        app.delete('/users/:user',[ apiAuthorization.validate, apiAuthorization.validatePermission("manage/users/remove"),userParamsValidation.deleteUser,userRulesValidation.deleteUser], userController.deleteUserByIdUsername);
        //Update User with the specified _id
        app.post('/users/delete', [ apiAuthorization.validate, apiAuthorization.validatePermission("manage/users/remove"),userParamsValidation.deleteUsers,userRulesValidation.deleteUsers],userController.deleteUsers);

        // app.post('/users/activate/:user', [ userParamsValidation.activateUser,userRulesValidation.activateUser],userController.activateUser);
        //simulate add many
        app.post('/users/simulate',[ apiAuthorization.validate, apiAuthorization.validatePermission("manage/users/add"),userParamsValidation.simulate], userController.simulate);
        //validate users emails
        app.post('/users/validate',[ apiAuthorization.validate, apiAuthorization.validatePermission("manage/users/add"),userParamsValidation.validateEmails], userController.validateEmails);

        // app.post('/users/recoverpassword/:user', [ userParamsValidation.recoverPassword,userRulesValidation.recoverPassword],userController.recoverPassword);

        //add api documentation
        swagger.addModels(userModel)
            .addGet(this.getUsers)
            .addGet(this.getAdUsers)
            .addGet(this.getAllDirectoriesUsers)
            .addGet(this.getCountUsers)
            .addGet(this.getUserByIdUsername)
            .addGet(this.getLoggedInUser)
            .addPost(this.simulate)
            // .addPost(this.byIds)
            .addPost(this.addUser)
            .addPost(this.addAdUser)
            //.addPost(this.verifySuperUser) // This is internal api only for installation process, please do not expose it!
            .addPost(this.forgetPassword)
            // .addPost(this.activateUser)
            // .addPost(this.recoverPassword)
            .addPost(this.deleteUsers)
            .addPost(this.validateEmails)
            .addPut(this.updateUser)
            .addDelete(this.deleteUserByIdUsername);
    };

    //document spec  - for api docs
    this.getUsers = {
        'spec': {
            "description" : "Operations about users",
            "path" :"/users",
            "notes" : "Returns all users and related metadata.",
            "summary" : "Returns all users and related metadata.",
            "method": "GET",
            "parameters" : [
                sw.queryParam("limit", "Limits the result set to a defined number of results.", "int", false, false),
                sw.queryParam("skip", "Defines how many items to skip before returning the results.", "int", false, false),
                sw.queryParam("search", "Enter a search query to return results matching the query.", "string", false, false),
                sw.queryParam("groups", "Enter a users groups IDs comma delimiter to return results matching the query.", "string", false, false),
                sw.queryParam("orderby", "Orders the results by field name. You can add multiple sort fields separated by a comma delimiter ','", "string", false, false),
                sw.queryParam("desc", "Defines the order of the results. True returns results in a descending order.", "boolean", false, false),
                sw.queryParam("onlyAD", "Searches only Active Directory users.", "boolean", false, false),
                sw.queryParam("groupsNames", "Includes the user's groups if the user belongs to one or more groups.", "boolean", false, false),
                sw.queryParam("includeDomain", "Returns the domain details of each AD user.", "boolean", false, false)
            ],
            "type" : "array",
            "items" : {"$ref" : "userResponse"},
            "responseMessages" : [swe.invalid('search'),swe.invalid('skip'), swe.forbidden()],
            "nickname" : "getUsers"
        }
    };

    this.getAdUsers = {
        'spec': {
            "description" : "Operations about users",
            "path" :"/users/ad",
            "notes" : "This function does not search for users in the Sisense repository.",
            "summary" : "Searches for users in Active Directory.",
            "method": "GET",
            "parameters" : [
                sw.queryParam("limit", "Limits the result set to a defined number of results. - 0 or blank to not limit", "int", false, false),
                sw.queryParam("checkExist", "Checks if the user exists in the database.", "boolean", false, false),
                sw.queryParam("search", "Enter a search query to return results matching the query.", "string", false, false),
                sw.queryParam("domain", "Enter a domain name or id.", "string", false, false)
            ],
            "type" : "array",
            "items" : {"$ref" : "ADuserSearchResponse"},
            "responseMessages" : [swe.invalid('search'),swe.invalid('skip'), swe.forbidden()],
            "nickname" : "getAdUsers"
        }
    };

    this.getAllDirectoriesUsers = {
        'spec': {
            "description" : "Operations about users",
            "path" :"/users/allDirectories",
            "notes" : "This function searches the Sisense repository, and if the user is not found, searches for the user in Active Directory.",
            "summary" : "Searches for users in all user directories.",
            "method": "GET",
            "parameters" : [
                sw.queryParam("limit", "Limits the result set to a defined number of results. - 0 or blank to not limit", "int", false, false),
                sw.queryParam("search", "contains", "string", false, false),
                sw.queryParam("groups", "Enter a users groups IDs comma delimiter to return results matching the query.", "string", false, false),
                sw.queryParam("includeDomain", "Returns the domain details of each AD user.", "boolean", false, false)
            ],
            "type" : "array",
            "items" : {"$ref" : "userResponse"},
            "responseMessages" : [swe.invalid('search'),swe.invalid('skip'), swe.forbidden()],
            "nickname" : "getAllDirectoriesUsers"
        }
    };

    this.getCountUsers = {
        'spec': {
            "description" : "Operations about users",
            "path" :"/users/count",
            "notes" : "Returns the number of users with the query result in their usernames.",
            "summary" : "Counts users using a defined query string.",
            "method": "GET",
            "type" : "userCount",
            "parameters" : [sw.queryParam("search", "Searches for users with usernames that include the query string.", "string", false, false)],
            "responseMessages" : [swe.invalid('limit'),swe.invalid('search'),swe.forbidden()],
            "nickname" : "countUsers"
        }
    };

    this.getUserByIdUsername = {
        'spec': {
            "description" : "Operations about users",
            "path" :"/users/{user}",
            "notes" : "get user by _id or userName",
            "summary" : "Returns metadata for a user by username or user ID.",
            "method": "GET",
            "parameters" : [sw.pathParam("user", "The user's ID or username", "string")],
            "type" : "userResponse",
            "responseMessages" : [swe.invalid('id'), swe.notFound('id'),swe.forbidden()],
            "nickname" : "getUserByIdUsername"
        }
    };

    this.byIds = {
        'spec': {
            "description" : "Operations about users",
            "path" :"/users/byIds",
            "notes" : "get list of users by ids",
            "summary" : "get list of users by ids",
            "method": "POST",
            "parameters" : [sw.bodyParam("list[string]", "List of users Ids", "list[string]")],
            "type" : "array",
            "items" : {"$ref" : "userResponse"},
            "responseMessages" : [swe.invalid('id'), swe.notFound('id'),swe.forbidden()],
            "nickname" : "byIds"
        }
    };

    this.getLoggedInUser = {
        'spec': {
            "description" : "Operations about users",
            "path" :"/users/loggedin",
            "notes" : "Retrieves my user details.",
            "summary" : "Retrieves my user details.",
            "method": "GET",
            "parameters" : [],
            "type" : "userResponse",
            "responseMessages" : [swe.forbidden()],
            "nickname" : "getLoggedInUser"
        }
    };

    this.forgetPassword = {
        'spec': {
            "description" : "Operations about users",
            "path" :"/users/forgetpassword",
            "notes" : "Sends a user an email to activate or reset the user's password.",
            "summary" : "Sends a user an email to activate or reset the user's password.",
            "method": "POST",
            "parameters" : [sw.bodyParam("userEmail", "The email of the user that requires a password reset.", "userEmail")],
            "responseMessages" : [swe.forbidden()],
            "nickname" : "forgetPassword"
        }
    };


    this.recoverPassword = {
        'spec': {
            "description" : "Operations about users",
            "path" :"/users/recoverpassword/{user}",
            "notes" : "Recovers a user's password by user ID or username.",
            "summary" : "Recovers a user's password by user ID or username.",
            "method": "GET",
            "parameters" : [sw.pathParam("user", "User's ID or username", "string"),sw.queryParam("src", "The URL of the page to redirect the user after activation.", "string", false, false),sw.bodyParam("userActivate", "The user object that needs to be updated.", "userActivate")],
            "responseMessages" : [swe.invalid('input'), swe.forbidden()],
            "nickname" : "recoverPassword"
        }
    };

    this.addUser = {
        'spec': {
            "description" : "Operations about users",
            "path" :"/users",
            "notes" : "Adds a new user.",
            "summary" : "Adds a new user.",
            "method": "POST",
            "parameters" : [sw.bodyParam("List[user]", "The user object includes all the user information.", "List[user]"),sw.queryParam("notify", "Send notifications to the user.", "boolean", false, false)],
            "type" : "userResponse",
            "responseMessages" : [swe.invalid('input'), swe.forbidden()],
            "nickname" : "addUser"
        }
    };

    this.simulate = {
        'spec': {
            "description" : "Operations about users",
            "path" :"/users/simulate",
            "notes" : "This operation does not add users.",
            "summary" : "Returns the users and related metadata of a simulated operation that adds multiple users.",
            "method": "POST",
            "parameters" : [sw.bodyParam("List[email/usernames]", "The list of user emails to add, or usernames for Active Directory mode.", "List[string]"), sw.queryParam("admode", "run in ActiveDirectory mode", "boolean", false, false)],
            "type" : "simulateAdd",
            "responseMessages" : [swe.invalid('input'), swe.forbidden()],
            "nickname" : "simulateAddUsers"
        }
    };



    this.addAdUser = {
        'spec': {
            "description" : "Operations about users",
            "path" :"/users/ad",
            "notes" : "add user",
            "summary" : "Imports a user from Active Directory as a new user in Sisense.",
            "method": "POST",
            "parameters" : [sw.bodyParam("user", "The user object that needs to be added to the directory.", "user")],
            "type" : "userResponse",
            "responseMessages" : [swe.invalid('input'), swe.forbidden()],
            "nickname" : "addUser"
        }
    };

    this.verifySuperUser = {
        'spec': {
            "description" : "Operations about users",
            "path" :"/users/super",
            "notes" : "add/verify super user",
            "summary" : "add/verify super user",
            "method": "POST",
            "parameters" : [sw.queryParam("secret", "secret", "string", false, false), sw.bodyParam("user", "super user object that needs to be added to the collection", "user")],
            "type" : "userResponse",
            "responseMessages" : [swe.invalid('input'), swe.forbidden()],
            "nickname" : "verifySuperUser"
        }
    };

    this.activateUser = {
        'spec': {
            "description" : "Operations about users",
            "path" :"/users/activate/{user}",
            "notes" : "Activates a user by user ID or username.",
            "summary" : "Activates a user by user ID or username.",
            "method": "GET",
            "parameters" : [sw.pathParam("user", "User's ID or username", "string"),sw.queryParam("src", "The URL of the page to redirect the user after activation.", "string", false, false),sw.bodyParam("userActivate", "The user object that needs to be updated.", "userActivate")],
            "responseMessages" : [swe.invalid('input'), swe.forbidden()],
            "nickname" : "activateUser"
        }
    };

    this.updateUser = {
        'spec': {
            "description" : "Operations about users",
            "path" :"/users/{user}",
            "notes" : "Updates one or more user details, by user ID or username.",
            "summary" : "Updates one or more user details, by user ID or username.",
            "method": "PUT",
            "parameters" : [sw.pathParam("user", "The user's ID or username.", "string"),sw.bodyParam("userUpdate", "The user object that needs to be updated.", "user")],
            "responseMessages" : [swe.invalid('id'), swe.notFound('id'),swe.forbidden()],
            "nickname" : "updateUser"
        }
    };


    this.deleteUsers = {
        'spec': {
            "description" : "Operations about users",
            "path" :"/users/delete",
            "notes" : "Deletes a user by user ID.",
            "summary" : "Deletes a user by user ID.",
            "method": "POST",
            "parameters" : [ sw.bodyParam("list[string]", "The user's ID.", "list[string]")],
            "responseMessages" : [swe.invalid('id'), swe.notFound('id'),swe.forbidden()],
            "nickname" : "deleteUsers"
        }
    };

    this.deleteUserByIdUsername = {
        'spec': {
            "description" : "Operations about users",
            "path" :"/users/{user}",
            "notes" : "Deletes a user by user ID or username.",
            "summary" : "Deletes a user by user ID or username.",
            "method": "DELETE",
            "parameters" : [sw.pathParam("user", "The user's ID or username.", "string")],
            "responseMessages" : [swe.invalid('id'), swe.notFound('id'),swe.forbidden()],
            "nickname" : "deleteUserByIdUsername"
        }
    };

    this.validateEmails = {
        'spec': {
            "description" : "Operations about users",
            "path" :"/users/validate",
            "notes" : "Validates existing users by entering their emails.",
            "summary" : "Validates existing users by entering their emails.",
            "method": "POST",
            "parameters" : [sw.bodyParam("List[string]", "List of emails of users that require validation.", "List[string]")],
            "responseMessages" : [swe.invalid('input'), swe.forbidden()],
            "nickname" : "validateEmails"
        }
    };
}
