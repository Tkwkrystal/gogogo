/**
 * Created with JetBrains WebStorm.
 * Log: a.elkayam
 * Date: 15/09/13
 * Time: 14:18
 * To change this template use File | Settings | File Templates.
 */
var funAuthController = require('./funAuth.controller');
var env_config = require('config');
var util = require('util');
var sessionValidator =  require('../../common/middlewares/validator.middleware');
var apiAuthorization = require('../../common/middlewares/apiAuthorization.middleware');
// var bodyParser = require('body-parser')  ;

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

      this.registerRoutes = function() {

        // Validate authentication中间键
         app.all('/funAuth*',[ apiAuthorization.validate ]);

        //Retrieve all logs
         app.post('/funAuth/addAuth',[], funAuthController.addfunAuth);

         app.get('/funAuth/getFunAuth',[], funAuthController.getFunAuth);

         app.post('/funAuth/updataFunAuth/:id',[],funAuthController.updataFunAuth);

         app.post('/funAuth/deleteFunAuth',[],funAuthController.deleteFunAuth);

         app.post("/funAuth/otherVision",[],funAuthController.otherVision)
         
    }
}
