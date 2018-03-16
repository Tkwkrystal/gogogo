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

var navverService = require('./navver.service');
var applicationError = require('../../common/errors/ApplicationErrors');
var server = require('../../common/server');
var securityUtils = require('../../common/security/securityUtils');


function navverController()  {

    this.updateNav = function(req, res) {
        var tree=req.body;
        var treeNodesID=tree._id;
        navverService.updataNavvers(treeNodesID,tree.treeNodes,function(err,items){
            if (err) return server.error(res, err);
            res.send(items);
        })
        // res.send(treeNodesID);
    }

    this.removeNavvers=function(){
        navverService.removeNavvers(function(err,items){
            if (err) return server.error(res, err);
            res.send(items);
        })
    }

    this.getNavver=function(req,res){
        navverService.getNavvers(function(err,item){
           if (err) return server.error(res, err);
           if(!(item&&item.length>0)){
                       var navItems={
                    treeNodes:[{
                    'title':'系统管理',
                    'nav_type':'0',
                    'levelIndex':0,
                    'url':'',
                    'rule_power':{
                        'rule':'power',
                        'viewID':[]
                      },
                    "nodes":[{
                        'title':'功能配置',
                        'nav_type':'1',
                        'levelIndex':1,
                        'url':'app.funAuth',
                        "nodes":[],
                        'rule_power':{
                            'rule':'power',
                            'viewID':[]
                          },
                    },{
                        'title':'用户配置',
                        'nav_type':'1',
                        'levelIndex':1,
                        'url':'app.userConfig',
                        "nodes":[],
                        'rule_power':{
                            'rule':'power',
                            'viewID':[]
                          },
                    },{
                        'title':'用户组配置',
                        'nav_type':'1',
                        'levelIndex':1,
                        'url':'app.userGroup',
                        "nodes":[],
                        'rule_power':{
                            'rule':'power',
                            'viewID':[]
                          },
                    }]
               },{
                        'title':'pc主页',
                        'levelIndex':0,
                        'nav_type':'1',
                        'url':'app.pcIndex',
                        "nodes":[],
                        'rule_power':{
                            'rule':'power',
                            'viewID':[]
                          },
                    },{
                        'title':'金融',
                        'nav_type':'1',
                        'levelIndex':0,
                        'url':'app.pcFinance',
                        "nodes":[],
                        'rule_power':{
                            'rule':'power',
                            'viewID':[]
                          },
                    },{
                        'title':'养生度假',
                        'nav_type':'1',
                        'levelIndex':0,
                        'url':'app.pcHoliday',
                        "nodes":[],
                         'rule_power':{
                            'rule':'power',
                            'viewID':[]
                          },
                    },{
                        'title':'商住合作开发',
                        'nav_type':'1',
                        'levelIndex':0,
                        'url':'app.pcNorm',
                        "nodes":[],
                        'rule_power':{
                            'rule':'power',
                            'viewID':[]
                          },
                    },{
                        'title':'工业物流',
                        'nav_type':'1',
                        'levelIndex':0,
                        'url':'app.pcIndustry',
                        "nodes":[],
                        'rule_power':{
                            'rule':'power',
                            'viewID':[]
                        },
                    },{
                        'title':'商业投资',
                        'nav_type':'1',
                        'levelIndex':0,
                        'url':'app.pcBusiness',
                        "nodes":[],
                        'rule_power':{
                            'rule':'power',
                            'viewID':[]
                        },
                    }]};
            navverService.addNavvers(navItems,function(err,items){
                    if (err) return server.error(res, err);
                    res.send(items.ops);
                })
            }else{
                res.send(item)
            }
        //    if(item.length>0&&item.treeNodes!=null){
        //        res.send(item)
        //    }
        //    else{
           //    var navItems={
           //     treeNodes:[{
           //     'title':'系统管理',
           //     'nav_type':0,
           //     'url':'',
           //     "nodes":[{
           //         'title':'功能配置',
           //         'nav_type':'1',
           //         'url':'tpl/funAuth/funAuth.html',
           //         "nodes":[]
           //     },{
           //         'title':'用户配置',
           //         'nav_type':"1",
           //         'url':'tpl/user/userConfig.html',
           //         "nodes":[]
           //     },{
           //         'title':'用户组配置',
           //         'nav_type':"1",
           //         'url':'tpl/user/userGroupConfig.html',
           //         "nodes":[]
           //     }]
           //}]};
               //平安专项
            //        var navItems={
            //         treeNodes:[{
            //         'title':'系统管理',
            //         'nav_type':0,
            //         'url':'',
            //         "nodes":[{
            //             'title':'功能配置',
            //             'nav_type':'1',
            //             'url':'app.funAuth',
            //             "nodes":[]
            //         },{
            //             'title':'用户配置',
            //             'nav_type':"1",
            //             'url':'app.userConfig',
            //             "nodes":[]
            //         },{
            //             'title':'用户组配置',
            //             'nav_type':"1",
            //             'url':'app.userGroup',
            //             "nodes":[]
            //         }]
            //    },{
            //             'title':'pc主页',
            //             'nav_type':1,
            //             'url':'pingAn.pcIndex',
            //             "nodes":[]
            //         },{
            //             'title':'金融',
            //             'nav_type':1,
            //             'url':'pingAn.pcFinance',
            //             "nodes":[]
            //         },{
            //             'title':'养生度假',
            //             'nav_type':1,
            //             'url':'pingAn.pcHoliday',
            //             "nodes":[]
            //         },{
            //             'title':'商住合作开发',
            //             'nav_type':1,
            //             'url':'pingAn.pcNorm',
            //             "nodes":[]
            //         }]};
            // navverService.addNavvers(navItems,function(err,items){
            //         if (err) return server.error(res, err);
            //         res.send(items.ops);
            //     })
            // }
        })
    }

    this.getNavversByID=function(req,res){
        var userID=req.parmes.userID;
        navverService.getNavversByID(userID,function(err,item){
             if (err) return server.error(res, err);
           res.send(item)
        })
    }

    this.getdeviceID=function(req,res){
         var result=securityUtils.generateSecret();
         res.send(result);
    }
}

navverController.instance = null;

navverController.getInstance = function(){
    if(this.instance === null){
        this.instance = new navverController();
    }
    return this.instance;
}

module.exports = navverController.getInstance();
