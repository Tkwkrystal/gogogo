/**
 * Created with JetBrains WebStorm.
 * Log: a.elkayam
 * Date: 15/09/13
 * Time: 14:18
 * To change this template use File | Settings | File Templates.
 */
var navverController = require('./navver.controller');
var env_config = require('config');
var util = require('util');
var sessionValidator =  require('../../common/middlewares/validator.middleware');
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

        // Validate authentication中间键
          app.all('/navver*',[ apiAuthorization.validate ]);

        //Retrieve all logs
         app.post('/navver/updateNav',[], navverController.updateNav);

         app.get('/navver/getNav',[],navverController.getNavver);

         app.get('/navver/remove',[],navverController.removeNavvers);

        //  app.get('/navver/getNavversByAuth',[], navverController.getNavversByAuth);

        //  app.get('/navver/getNavversByID',[], navverController.getNavversByID);

        //  app.post('/navver/addNav',[], navverController.addNavver);
    }
}


