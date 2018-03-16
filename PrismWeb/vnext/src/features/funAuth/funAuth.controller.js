/**
 * Created with JetBrains WebStorm.
 * Log: JS
 * Date: 12/06/17
 * Time: 17:16
 * To change this template use File | Settings | File Templates.
 */


/*
 * widget controller which responsible
 * for all widget operation
 */
var funAuthService = require('./funAuth.service');
var applicationError = require('../../common/errors/ApplicationErrors');
var server = require('../../common/server');
var securityUtils = require('../../common/security/securityUtils');
var jwt = require('jwt-simple');
var url = require('url');


function funAuthController()  {
    this.addfunAuth=function(req,res){
        var funAuth=req.body;
        funAuthService.addfunAuth(funAuth,function(err,result){
            res.send(result);
        })

    }
    this.getFunAuth=function(req,res){
       funAuthService.getfunAuths(function(err,result){
           if (err) return server.error(res, err);
           res.send(result);
       })
    };
    this.updataFunAuth=function(req,res){
        var ID=req.body._id;
        var updataObj=req.body;
        funAuthService.updataFunAuth(ID,updataObj,function(err,data){
            if (err) return server.error(res, err);
            res.send(data);
        })
    };
    this.deleteFunAuth=function(req,res){
        var ID=req.body._id;
        funAuthService.deleteFunAuth(ID,function(err,data){
            if (err) return server.error(res, err);
            res.send(data);
        })
    }

    this.otherVision=function(req,res){
        console.log(req);
        var payload = {
            iat: parseInt(((new Date()).getTime()) / 1000),
            sub: req.body.username,
            jti: guid(),
            // exp: ((new Date().getTime() + 180 * 60000 )/ 1000) // expires in 3 hours
        };
        // encode
        var token = jwt.encode(payload, "47433e27e30f9fa4f5ab5e28ef27e50c");
        var dashboards=req.body.dashboards;
        var canshu=encodeURIComponent(req.body.canshu);
        // var filter=dashboards+canshu;
        //http://localhost:3000/api/auth/wise/eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpYXQiOjE1MTUwNDY1ODksInN1YiI6Inh6cSJ9.CYgFy6lLwzD-gNLX-yJG8-dDGqCtnSmGk2mnDD-rLxU/dashboards/travelStaffDetail.html
        var redirect = "http://test-bi-pare.pa18.com/api/auth/wise/"+token+dashboards+canshu;
        var query = url.parse(req.url, true).query;
        if (query['return_to']) {
            redirect += '&return_to=' + encodeURIComponent(query['return_to']);
        }
        // var redirect={"datga":"12"};
        // payload=null;
        res.send(redirect);
        // response.writeHead(302, {
        //     'Location': redirect
        // });
        // response.end();
    };


    function guid() {
        function s4() {
          return Math.floor((1 + Math.random()) * 0x10000)
            .toString(16)
            .substring(1);
        }
        return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
          s4() + '-' + s4() + s4() + s4();
    }
    // this.saveFun=function(req,res){
    //     res.send({"data":"test"});
    // }
    // this.testFun=function(req,res){
    //     res.send({"data":"test"});
    // }
}

funAuthController.instance = null;

funAuthController.getInstance = function(){
    if(this.instance === null){
        this.instance = new funAuthController();
    }
    return this.instance;
}

module.exports = funAuthController.getInstance();
