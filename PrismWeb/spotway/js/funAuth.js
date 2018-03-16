'use strict';
var app=angular.module('app.funAuth', ['app.services','ngDialog']);
app.controller('funAuthController',["$scope","funAuthHelper","ngDialog","$http","$sce","sisenseHelper",function($scope,$funAuthHelper,$ngDialog,$http,$sce,$sisenseHelper){
    // $scope.funAuthList=[];
    $funAuthHelper.getFunAuth().then(function(data){
        $scope.funAuthList=data
    });
    $scope.chooseArr=[];
    $scope.addfunAuth=function(){
        $scope.operationType="add";
        $ngDialog.open({
            template: 'tpl/funAuth/AddFunAuth.html',
            controller:'funAuthAddController',
            className: 'ngdialog-theme-default ngdialog-theme-custom',
            scope: $scope,
            showClose: true,
            closeByDocument: false, 
            closeByEscape: true,
            preCloseCallback:function(data){
                if(data){
                    $scope.funAuthList.push(data);
                }       
            }
        });
    };
    $scope.chooseALLs=function(funAuthList){
        var len= $scope.funAuthList.length;
        if(document.getElementsByName('checkAllItems')[0].checked){
            var check=true;
        }else{
            var check=false;
        }
       if(check){
           $scope.chooseArr=angular.copy(funAuthList);           
           for(var a=0;a<len;a++){
                $(document.getElementsByName('check')[a]).prop("checked", true);
           }
       }else{
            $scope.chooseArr=[];
               for(var a=0;a<len;a++){
               $(document.getElementsByName('check')[a]).prop("checked", false);             
           }
       }
    };
    $scope.chooseOne=function(funAuth,index){
        var len=  $scope.funAuthList.length;
        if(document.getElementsByName('check')[index].checked){
            var x=true;
        }else{
            var x=false;
        }
        if(x){
            $scope.chooseArr.push(funAuth);
              if($scope.chooseArr.length==len){
                 $(  document.getElementsByName('checkAllItems')[0]).prop("checked", true);
                }
        }else{
            $scope.chooseArr.splice($scope.chooseArr.indexOf(funAuth),1);//取消选中
        }
         if($scope.chooseArr.length<len){
             $(  document.getElementsByName('checkAllItems')[0]).prop("checked", false);
        };
    };

    $scope.editFunAuth=function(){
        if($scope.chooseArr.length!=1){
            $scope.errMassage="编辑用户时,请选择一条数据!";
            var dialog = $ngDialog.open({
                template:
                    '  <div class="panel-heading">'+ $scope.errMassage +'  </div>' ,
                plain: true,
                showClose: true,
            }); 
        }else{
            $scope.funAuth=$scope.chooseArr[0];
            $scope.operationType="edit";
            $ngDialog.open({
                template: 'tpl/funAuth/AddFunAuth.html',
                controller:'funAuthAddController',
                className: 'ngdialog-theme-default ngdialog-theme-custom',
                scope: $scope,
                showClose: true,
                closeByDocument: false, 
                closeByEscape: true,
                preCloseCallback:function(data){
                    console.log(data);
                }
            });
        }
     };
     $scope.deleteFunAuth=function(){
         for(var a=0;a<$scope.chooseArr.length;a++){
             var data=$scope.chooseArr[a];
             $scope.funAuthList.splice( $scope.funAuthList.indexOf(data),1);
             $funAuthHelper.deleteFunAuth(data).then(function(res){}); 
             var id=data.url.split("/dashboards/")[1].split("?")[0];
              $sisenseHelper.deleteDash(id).then(function(res){});   
         //   $http.delete("/api/dashboards/"+id).then(function(res){console.log(res)})
         }
       
     };
     $scope.showPage=function(data){         
        if(data.nav_type.toString()=="2"){
          typeof data.url=='string'? data.url= $sce.trustAsResourceUrl(data.url):data.url;
        }
        data.showIndex=1;
        $.each($scope.$root.navItems,function(index,navItem){
             navItem==data?  navItem.showIndex=1:navItem.showIndex=0;
        });
        if(!($scope.$root.navItems.indexOf(data)>-1)){
            $scope.$root.navItems.push(data);
        }
     }; 
}]);
app.controller("funAuthAddController",["$scope","funAuthHelper",'navverHelper','sisenseHelper',"$http",function($scope,$funAuthHelper,$navverHelper,$sisenseHelper,$http){      
    $scope.chooseArr=[];      
    $scope.systemLists=[{
        "title":'用户配置',
          "url":"tpl/user/userConfig.html",
      },{
          "title":'用户组配置',
          "url":"tpl/user/userGroupConfig.html",
      },{
          "title":'组织配置',
          "url":"tpl/user/userConfig.html",
      },{
          "title":'功能配置',
          "url":"tpl/funAuth/funAuth.html",
      },{
          "title":'权限配置',
          "url":"tpl/funAuth/funAuth.html",
      }];
    if($scope.operationType=="add"){
        $scope.funAuth={
            'auths':[],
            'funder':"admin",
            'title':'',
            'nav_type':1,
            'url':'',
            'code':'',
            'create_time':new Date()
        };
        $scope.sysList_url=$scope.systemLists[0];
    }else{
       switch( $scope.funAuth.nav_type.toString()){
           case "1":
           for(var a=0;a<$scope.systemLists.length;a++){
               if($scope.systemLists[a].url==$scope.funAuth.url){
                   $scope.sysList_url=$scope.systemLists[a];
               }
           }
           ;break;
           case "2": $scope.third_url=$scope.funAuth.url;break;
           default:break;
       }
    }
    $sisenseHelper.getEcdata().then(function(ecData){
        $scope.dashboardLists=ecData;
        if($scope.operationType=="edit"&&$scope.funAuth.nav_type.toString()=="3"){
            for(var a=0;a<$scope.dashboardLists.length;a++){
                if($scope.dashboardLists[a].database==$scope.funAuth.url){
                    $scope.dashboardList_url=$scope.dashboardLists[a];
                }
            }
        }else{
            $scope.dashboardList_url= $scope.dashboardLists[0];
        }       
    })
    $scope.x=false;//默认未选中
    var Q=$funAuthHelper.getAuth();
    Q.then(function(data){
        if(data&&data.length>0){
            $scope.authList=data;
        }
    },function(data){
        console.log(data);
    })
    $scope.chooseAuth=function(item){
        if($scope.funAuth.auths.indexOf(item)>-1){
            return false;
        }
        $scope.funAuth.auths.push(item);
    };
    $scope.chooseALLs=function(users){
        var len= $scope.funAuth.auths.length;
        if(document.getElementsByName('checkAllItems')[0].checked){
            var check=true;
        }else{
            var check=false;
        }
       if(check){
           $scope.chooseArr=angular.copy(users);           
           for(var a=0;a<len;a++){
                $(document.getElementsByName('check')[a]).prop("checked", true);
           }
       }else{
            $scope.chooseArr=[];
               for(var a=0;a<len;a++){
               $(document.getElementsByName('check')[a]).prop("checked", false);             
           }
       }
    };
    $scope.chooseOne=function(user,index){
        var len= $scope.funAuth.auths.length;
        if(document.getElementsByName('check')[index].checked){
            var x=true;
        }else{
            var x=false;
        }
        if(x){
            $scope.chooseArr.push(user);
              if($scope.chooseArr.length==len){
                 $(  document.getElementsByName('checkAllItems')[0]).prop("checked", true);
                }
        }else{
            $scope.chooseArr.splice($scope.chooseArr.indexOf(user),1);//取消选中
        }
         if($scope.chooseArr.length<len){
             $(  document.getElementsByName('checkAllItems')[0]).prop("checked", false);
        };
    };
    $scope.deleteItem=function(){
        for(var a=0;a<$scope.chooseArr.length;a++){
            $scope.funAuth.auths.splice($scope.chooseArr[a],1);
        }
    };
    $scope.save=function(){
        $scope.funAuth.title = $scope.funAuth1.title;
        $scope.funAuth.code = $scope.funAuth1.code;
        switch($scope.funAuth.nav_type.toString()){
            case '1':
            if(!$scope.sysList_url){
                return false;
            }
            $scope.funAuth.url=$scope.sysList_url.url;
            if($scope.operationType=="edit"){
                $funAuthHelper.updataFunAuth($scope.funAuth).then(function(data){
                     $scope.closeThisDialog($scope.funAuth);
                 },function(data){
                 })
            }else{
                $funAuthHelper.addFunAuth($scope.funAuth).then(function(data){
                    $scope.closeThisDialog($scope.funAuth);
                 },function(data){
                     console.log(data);
                 })
            }    
            break;    
            case "2":
            if(!$scope.third_url){
                return false;
            }

            $scope.funAuth.url=$scope.third_url;
          //  $scope.funAuth.url=$sce.trustAsResourceUrl($scope.third_url);
            if($scope.operationType=="edit"){
                $funAuthHelper.updataFunAuth($scope.funAuth).then(function(data){
                     $scope.closeThisDialog($scope.funAuth);
                 },function(data){
                     //  console.log(data);
                 })
            }else{
                $funAuthHelper.addFunAuth($scope.funAuth).then(function(data){
                    $scope.closeThisDialog($scope.funAuth);
                 },function(data){
                     console.log(data);
                 })
            }        
            break;
            case "3":
            if(!$scope.dashboardList_url){
                return false;
            }
            var dash={
                "title":$scope.funAuth.title,
                "datasource":{
                    "title":$scope.dashboardList_url.title,
                    "fullname":$scope.dashboardList_url.fullname,
                    "id":$scope.dashboardList_url.id,
                    "address":$scope.dashboardList_url.address,
                    "database":$scope.dashboardList_url.database
                    },
                "type":"dashboard",
                "desc":"",
                "style":{
                    "name":"vivid",
                    "palette":{
                        "colors":["#00cee6","#9b9bd7","#6EDA55","#fc7570","#fbb755","#218A8C"],
                        "name":"Vivid",
                        "sortOrder":10,
                        "isSystem":true,
                        "systemDefault":true
                    }
                },
                "editing":true
            };
            $http.post("/api/dashboards",dash).success(function(data){
                $scope.funAuth.url="/app/main#/dashboards/"+data[0].oid+"?embed=true&l=false&r=false&h=false&t=true";
                if($scope.operationType=="edit"){
                    $funAuthHelper.updataFunAuth($scope.funAuth).then(function(data){
                         $scope.closeThisDialog($scope.funAuth);
                     },function(data){
                     })
                }else{
                    $funAuthHelper.addFunAuth($scope.funAuth).then(function(data){
                        $scope.closeThisDialog($scope.funAuth);
                     },function(data){
                         console.log(data);
                     })
                }        
            }).error(function(data){
                console.log(data);
            });break;
            default:break;
        }
    };
    // $scope.validateName=function(){
    //     $scope.funAuth.title? $scope.nameTest=!0: $scope.nameTest=!1;
    // };
    // $scope.validateCode=function(){
    //     $scope.funAuth.code? $scope.codeTest=!0: $scope.codeTest=!1;
    // };
}]);