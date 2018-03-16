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

var authConfigService = require('./authConfig.service');
var applicationError = require('../../common/errors/ApplicationErrors');
var server = require('../../common/server');
var securityUtils = require('../../common/security/securityUtils');


function authConfigController()  {

    this.addAuthConfig = function(req, res) {
        // var result={"data":'1'};
        // res.send(result);
        var newAuth=[{
          name:"新增",
          create_time:new Date(),
          isforbidden:false,
          code:'add',
        },{
          name:"删除",
          create_time:new Date(),
          isforbidden:false,
          code:'delete',
        },{
          name:"修改",
          create_time:new Date(),
          isforbidden:false,
          code:'edit',
        },{
          name:"查询",
          create_time:new Date(),
          isforbidden:false,
          code:'view_reports',
        }];
        for(var a=0;a<newAuth.length;a++){
            authConfigService.addauthConfig(newAuth[a],function (err, result) {
                if (err) return server.error(res, err);
                res.send(result)
            });
        }
    }

    this.getAuthConfig=function(req,res){
        authConfigService.getAuthConfig(function(err,item){
           if (err) return server.error(res, err);
           if(item&&item.length>0){
            res.send(item);
           }else{
            var newAuth=[{
                name:"新增",
                create_time:new Date(),
                isforbidden:false,
                code:'add',
              },{
                name:"删除",
                create_time:new Date(),
                isforbidden:false,
                code:'delete',
              },{
                name:"修改",
                create_time:new Date(),
                isforbidden:false,
                code:'edit',
              },{
                name:"查询",
                create_time:new Date(),
                isforbidden:false,
                code:'search',
              }];
              for(var a=0;a<newAuth.length;a++){
                  authConfigService.addauthConfig(newAuth[a],function (err, result) {
                    //   if (err) return server.error(res, err);
                    //   res.send(newAuth)
                  });
              }
              res.send(newAuth);
           }
          
        })
    }

    // this.getNavversByID=function(req,res){
    //     var userID=req.parmes.userID;
    //     navverService.getNavversByID(userID,function(err,item){
    //          if (err) return server.error(res, err);
    //        res.send(item)
    //     })
    // }

    // this.getdeviceID=function(req,res){
    //      var result=securityUtils.generateSecret();
    //      res.send(result);
    // }
}

authConfigController.instance = null;

authConfigController.getInstance = function(){
    if(this.instance === null){
        this.instance = new authConfigController();
    }
    return this.instance;
}

module.exports = authConfigController.getInstance();
