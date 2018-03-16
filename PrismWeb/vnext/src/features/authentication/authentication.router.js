/**
 * Created with JetBrains WebStorm.
 * User: a.elkayam
 * Date: 15/09/13
 * Time: 14:18
 * To change this template use File | Settings | File Templates.
 */

var util = require('util');
var authController = require('./authentication.controller');
var authenticationParamsValidation = require('./authenticationValidation.middleware');
var env_config = require('config');
var authModel = require("./authentication.document");
var sessionValidator =  require('../../common/middlewares/validator.middleware');
var apiAuthorization = require('../../common/middlewares/apiAuthorization.middleware');

//var sw = require(process.cwd() + "/Common/node/swagger.js");
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
    }

    /**
     * routing's
     **/
    this.registerRoutes = function() {
        //logout
        app.get('/auth/secret',authController.getPasswordPhrase);
        //render signup page
        app.get("/auth/signup", function (req, res) {res.render("signup");});
        //render login page
        app.get("/auth/login", function(req, res){ res.render("login");});

         app.get("/auth/startup/:email",[authenticationParamsValidation.startup] ,authController.startup);
        //logout
        app.get('/auth/logout',authController.logout);
        //is authentication
        app.get('/auth/isauth',authController.isAuthenticated);
        //post signUp
        app.post("/auth/signup", [ authenticationParamsValidation.signup,authController.isUserExist,authController.signUp],authController.cookieGeneration);
        //post login
        app.post("/auth/login", sessionValidator.credentials,authController.login);
        //post tryLogin
        app.post("/auth/tryLogin", sessionValidator.credentials,authController.tryLogin);

        app.get("/auth/wx/:token",authController.wxLogin);

       
        //add api documentation
        swagger.addModels(authModel)
               // .addGet(this.secret)
                .addGet(this.logout)
                .addGet(this.isauth)
               // .addPost(this.signup)
               //.addPost(this.login)

    }

    //document spec  - for api docs

    this.secret = {

        'spec': {
            "description" : "Operations about auth",
            "path" :"/auth/secret",
            "notes" : "Get password secret key",
            "summary" : "Get password secret key",
            "method": "GET",
            "parameters" : [],
            "nickname" : "secret",
            "responseMessages" : [swe.invalid('id'),swe.forbidden()]
        }
    };

        this.signup = {

            'spec': {
                "description" : "Operations about auth",
                "path" :"/auth/signup",
                "notes" : "Sign up new user",
                "summary" : "Sign up new user",
                "method": "POST",
                "parameters" : [sw.bodyParam("userName password", "username  and password for new user","auth")],
                "nickname" : "signup",
                "responseMessages" : [swe.invalid('id'),swe.forbidden()]
            }
        };


    this.login = {
        'spec': {
            "description" : "Operations about auth",
            "path" :"/auth/login",
            "notes" : "login  user",
            "summary" : "login user",
            "method": "POST",
            "parameters" : [sw.queryParam("src", "src", "string", false, false),sw.queryParam("debugMode", "if true does't try to decrypt the body", "boolean", false, false),sw.bodyParam("userName password", "username  and password for new user","auth")],
            "nickname" : "login"
        }
    };
        this.logout= {
            'spec': {
                "description" : "Operations about widgets",
                "path" :"/auth/logout",
                "notes" : "Forces the user to be logged out.",
                "summary" : "Forces the user to be logged out.",
                "method": "GET",
                "responseMessages" : [swe.invalid('id'),swe.forbidden()],
                "nickname" : "logout"
            }
        };

        this.isauth = {
            'spec': {
                "description" : "Operations about auth",
                "path" :"/auth/isauth",
                "notes" : "Returns users that are logged in.",
                "summary" : "Returns users that are logged in.",
                "method": "GET",
                "type" : "isAuth",
                "nickname" : "isauth"
            }
        };

}


