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

var userNavService = require('./userNav.service');
var applicationError = require('../../common/errors/ApplicationErrors');
var server = require('../../common/server');


function userNavController()  {

    this.addNavver = function(req, res) {
        // var result={"data":'1'};
         res.send(req.body);
        // var navver=[{
        //     'name':"菜单1",
        //     'func':'',
        //     'create_time':new Date(),
        //     'childList':[{
        //                     'name':"菜单1.1",
        //                     'func':'',
        //                     'create_time':new Date(),
        //                     'childList':[{
        //                                     'name':"菜单1.1.1",
        //                                     'func':'',
        //                                     'create_time':new Date(),
        //                                     'childList':{}
        //                                 }]
        //                 },[{
        //                         'name':"菜单1.2",
        //                         'func':'',
        //                         'create_time':new Date(),
        //                         'childList':{}
        //                   }]
        //                 ]
        // },{
        //     'name':"菜单2",
        //     'func':'',
        //     'create_time':new Date(),
        //     'childList':[{
        //                     'name':"菜单2.1",
        //                     'func':'',
        //                     'create_time':new Date(),
        //                     'childList':[{
        //                                     'name':"菜单2.1.1",
        //                                     'func':'',
        //                                     'create_time':new Date(),
        //                                     'childList':{}
        //                                 }]
        //                 },[{
        //                         'name':"菜单2.2",
        //                         'func':'',
        //                         'create_time':new Date(),
        //                         'childList':{}
        //                   }]
        //                 ]
        // }]
        // userNavService.addNavvers(navver,function (err, result) {
        //     if (err) return server.error(res, err);
        //     res.send(result)
        // });
    }

    this.getNavversByAuth=function(req,res){
        userNavService.getNavvers(function(err,item){
           if (err) return server.error(res, err);
           res.send(item)
        })
    }

    this.getNavversByID=function(req,res){
        var userID=req.parmes.userID;
        userNavService.getNavversByID(userID,function(err,item){
             if (err) return server.error(res, err);
           res.send(item)
        })
    }
}

userNavController.instance = null;
userNavController.getInstance = function(){
    if(this.instance === null){
        this.instance = new userNavController();
    }
    return this.instance;
}

module.exports = userNavController.getInstance();