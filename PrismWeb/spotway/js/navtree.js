'use strict';

/* Services */


// Demonstrate how to register services
var app=angular.module('app.navtrees', ['pascalprecht.translate', 'ngCookies', 'app.services', "app.filters",'ui.tree','ngDialog'])
app.controller('navController',["$scope","$http","navverHelper","$localStorage","$window","$state","$sce","ngDialog","$rootScope",'userHelper',function($scope,$http,$navverHelper,$localStorage,$window,$state,$sce,$ngDialog,$rootScope,userHelper){


  var promise = $navverHelper.getNav();
    promise.then(function (data) {
      if(!$rootScope.user){
        var userID=$window.sessionStorage.getItem("userId");
        userHelper.getUser(userID).then(function(user){
          $rootScope.user=user;
          $rootScope.navTree=data[0];
          $scope.oldNavItes=$navverHelper.userNav(data[0],$rootScope.user);
          $scope.data= $scope.oldNavItes.treeNodes;
          for (var i=0;i<$scope.data.length;i++){
            if ($scope.data[i].url=='app.pcFinance'){
                $scope.data[i].src='img/pingAnImg/jrcp.png';
            }else if ($scope.data[i].url=='app.pcNorm'){
                  $scope.data[i].src='img/pingAnImg/kftz.png';
              }else if ($scope.data[i].url=='app.pcIndustry'){
                  $scope.data[i].src='img/pingAnImg/gywl.png';
              }else if ($scope.data[i].url=='app.pcHoliday'){
                  $scope.data[i].src='img/pingAnImg/ysdj.png';
              }else if ($scope.data[i].url=='app.pcBusiness'){
                  $scope.data[i].src='img/pingAnImg/sydc.png';
              }else if ($scope.data[i].url=='app.pcIndex'){
                  $scope.data[i].src='img/pingAnImg/clhw.png';
              }else{
                $scope.data[i].src='img/pingAnImg/3.png';
            }
          }
        })
      }else{
        $rootScope.navTree=data[0];
        $scope.oldNavItes=$navverHelper.userNav(data[0],$rootScope.user);
        $scope.data= $scope.oldNavItes.treeNodes;
          console.log( $scope.data);

      }
    }, function (data) {
    });
  $scope.showUlModle=function () {
    if($rootScope.user.roleName=="super"){
      $(".treeUl").hide();
      $(this.$element[0]).find('.treeUl ').show();
      window.event? window.event.cancelBubble = true : e.stopPropagation();
    }else{
      alert("您无权限进行此操作，谢谢。")
    }

  };
  $(document).click(function () {
    $(".treeUl").hide();

  });

  $scope.updateNav=function(nav){
    $scope.oldNavItes.treeNodes=nav;
      var promise = $navverHelper.updateNav( $scope.oldNavItes);
      promise.then(function (data) {
      }, function (data) {
      });
  };
  $scope.$watch(function(){
    return JSON.stringify($scope.data);
    },function(){
      if($scope.data&&$rootScope.user.roleName=="super"){
        $scope.updateNav($scope.data);
      }
  });
  $scope.navChangeShow=true;
  $scope.navChange=function () {
    $scope.navChangeShow=!$scope.navChangeShow;
  };
  $scope.removeItem = function (scope) {
    if(scope.$modelValue.rule_power.rule=="power"){
      alert("内置页面无法删除！");
      return false;
    }else{
      scope.remove();
    }

  };
  $scope.toggle = function (scope) {
    scope.toggle();
  };
  $scope.moveLastToTheBeginning = function () {
    var a = $scope.data.pop();
    $scope.data.splice(0, 0, a);
  };
  $scope.newSubItem = function (sel,type) {
    if(type=="newItem"){
      $scope.newItem=true;
    }else{
      $scope.newItem=false;
      $scope.chooseNavItem= sel.$modelValue;
    }
    if(sel){
      $scope.oneLevel=sel.$modelValue.levelIndex+1;
    }
    $ngDialog.open({
      template: 'tpl/nav/nav.html',
      controller:'navAddController',
      className: 'ngdialog-theme-default ngdialog-theme-custom',
      scope: $scope,
      showClose: true,
      closeByDocument: false,
      closeByEscape: true,
      preCloseCallback:function(data){
        if(data&&data!="$closeButton"){
          if(sel){
            sel.$modelValue.nodes.push(data);
          }else{
            $scope.data.push(data);
          }
        }
         
        }
    });
  };
  $scope.collapseAll = function () {
    $scope.$broadcast('angular-ui-tree:collapse-all');
  };

  $scope.expandAll = function () {
    $scope.$broadcast('angular-ui-tree:expand-all');
  };

  $scope.showUrl=function(node){
      if(node.url.substring(0,1)=="h"){
          if(node.url.indexOf("dashboards")!=-1){
              $scope.fuzhuurl=node.url;
              $scope.fuzhuur2=$scope.fuzhuurl.substr($scope.fuzhuurl.indexOf('#') + 1, $scope.fuzhuurl.indexOf('?folder'));
              $scope.dashboards=$scope.fuzhuur2 + '/';
              // console.log($scope.dashboards);
              //    http://bi-pare.pa18.com/app/main#/dashboards/5a311315a6f72c780c0000bb?folder=5a3268529ae45c239c307272
              $http.post('/api/funAuth/otherVision',{'username': $scope.user.userName,'dashboards':$scope.dashboards}).then(function(response,status){
                  console.log(response);
                  window.open(response.data,"_blank");
              })

          }else{

              window.open(node.url)
          }


      }else {
          $state.go(node.url);
      }

      //加班写的
      $(this.$element[0]).parent().parent().children().eq(1).children().eq(0).children().eq(0).children().eq(0).css("transform","scale(1.0)");
      $(this.$element[0]).parent().parent().children().eq(2).children().eq(0).children().eq(0).children().eq(0).css("transform","scale(1.0)");
      $(this.$element[0]).parent().parent().children().eq(3).children().eq(0).children().eq(0).children().eq(0).css("transform","scale(1.0)");
      $(this.$element[0]).parent().parent().children().eq(4).children().eq(0).children().eq(0).children().eq(0).css("transform","scale(1.0)");
      $(this.$element[0]).parent().parent().children().eq(5).children().eq(0).children().eq(0).children().eq(0).css("transform","scale(1.0)");
      $(this.$element[0]).parent().parent().children().eq(6).children().eq(0).children().eq(0).children().eq(0).css("transform","scale(1.0)");
      var imgsrcx=$(this.$element[0]).children().eq(0).children().eq(0);
      var imgsrcz=imgsrcx.attr("src").indexOf(".");
      imgsrcx.css("transform","scale(1.5)")

      //如果是事业部或者主页就变色
      if($(this.$element[0]).children().eq(1).text().indexOf("事业部")>=0||$(this.$element[0]).children().eq(1).text().indexOf("主页")>=0){
          $(this.$element[0]).css("background","#0a9ccc");
          $(this.$element[0]).parent().siblings().children().css("background","#1D2B36");
      }else{
          $(".angular-ui-tree-handle").css("background","#1D2B36");
          $(".angular-ui-tree-handle").find("img:first").css("transform","scale(1.0)")
      }
      //$(this.$element[0]).parent().siblings().children().eq(0).children().eq(0).children().attr("src","1");
    // if(!node.nav_type){
    //   return false;
    // }
    // $state.go("app.dashboard");
    // if( !$scope.$root.navItems){
    //   $scope.$root.navItems=[];
    // };
    // $.each($scope.$root.navItems,function(index,navItem){
    //   navItem==node?navItem.showIndex=1:navItem.showIndex=0;
    // });
    // if( !($scope.$root.navItems.indexOf(node)>-1)){
    //   node.showIndex=1;
    //   switch (node.nav_type.toString()){
    //       case '1': $scope.$root.navItems.push(node);break;
    //       case '2': node.url=typeof( node.url)=="string"? $sce.trustAsResourceUrl(node.url):node.url;
    //               $scope.$root.navItems.push(node);break;
    //       case '3': $scope.$root.navItems.push(node);break;
    //       default:break;
    //   }
    // };
  }
}]);
app.controller('ulController',["$scope",function($scope){
  $scope.navLists=$scope.$root.navItems||[];
  $scope.$watch(function() {
    return $scope.$root.navItems;
  }, function() {
    $scope.navLists = $scope.$root.navItems;
  }, true);
  $scope.close=function(navList){
     $scope.$root.navItems.splice($scope.navLists.indexOf(navList),1);
    if(navList.showIndex){
      $scope.$root.navItems[ $scope.$root.navItems.length-1].showIndex=1;
    };    
    $scope.navLists= $scope.$root.navItems;
  };
  $scope.showPages=function(navList){
    $.each($scope.$root.navItems,function(index,navItem){
      navItem==navList?navItem.showIndex=1:navItem.showIndex=0;
    });
  };
}]);
app.controller("navAddController",["$scope","sisenseHelper","funAuthHelper","userHelper",function($scope,$sisenseHelper,$funAuthHelper,$userHelper){
  function containerArr(arr,e){
    for(var i=0;i<arr.length;i++)
    {
      if(arr[i]._id== e._id)
        return true;
    }
    return false;
  }
  // $scope.navItem=$scope.chooseNavItem||{
  //   'title':'',
  //   'folder_type':'0',
  //   'url':'',
  //   "nodes":[],
  //   "levelIndex":$scope.oneLevel!=null?$scope.oneLevel:0,
  //   'rule_power':{
  //     'rule':'',
  //     'viewID':[]
  //   },
  // };
  //$scope.chooseNavItem1 = angular.copy($scope.chooseNavItem1=angular.copy($scope.chooseNavItem));
  $scope.arrUsers=[];
  $funAuthHelper.getFunAuth().then(function(data){
    $scope.funAuthLists=data
  });
  $scope.$watch('searchUserOrGroup',function(){
     var dash=[];
    if($scope.searchUserOrGroup){
      var Q=$userHelper.getGroupsFilter($scope.searchUserOrGroup);
      Q.then(function(data){
        for(var i= 0;i<data.length;i++){
          dash.push(data[i]);
        }
      },function(data){
        console.log(data);
      })
      var Q=$userHelper.getUsersFilter($scope.searchUserOrGroup);
      Q.then(function(res){
        for(var n= 0;n<res.length;n++){
          dash.push(res[n]);
        }
      },function(data){
        console.log(data);
      })
      setTimeout(function () {
        $scope.$apply(function () {
          $scope.searchUserLists=dash;
        });
      },1000);
    }
  });
  $scope.pushUserGroup=function(item){
    if(!containerArr( $scope.navItem.rule_power.viewID,item)){
      $scope.navItem.rule_power.viewID.push(item);
    }
    $scope.searchUserLists=[];
    $scope.searchUserOrGroup=null;
  };
  $scope.chooseUsersItem=function(item){
      if(!containerArr($scope.arrUsers,item)){
        $scope.arrUsers.push(item);
      }else{
        $scope.arrUsers.splice(item,1);
      }
     // console.log($scope.arrUsers);
  }
  $scope.deleteUserGroup=function(){
    $.each($scope.arrUsers,function(index,user){
      if(containerArr( $scope.navItem.rule_power.viewID,user)){
        $scope.navItem.rule_power.viewID.splice(user,1)
      }
    })
  };
  //nav_type：表示0：文件夹 1：页面；
  //folder_type：表示0：文件夹 1：内置功能 2：dash页面 3：第三方插件
  //levelIndex:层级
  $scope.save=function () {
    $scope.chooseNavItem.title = $scope.navItem.title;
    if($scope.chooseNavItem){
      $scope.closeThisDialog();
      return;
    }
    switch ($scope.navItem.folder_type.toString()){
        case "0":
            $scope.navItem.nav_type=$scope.navItem.folder_type;break;
        case '1':
            if(!$scope.funAuthList_url){
                return false;
            }
            var item= JSON.parse($scope.funAuthList_url);
            $scope.navItem.nav_type=item.nav_type;
            $scope.navItem.url=item.url;break;
        default:break;
    }
       $scope.closeThisDialog($scope.navItem);
  }

  // $scope.closeThisDialog = function (value) {
  //    if(!value){
  //     $scope.chooseNavItem = $scope.chooseNavItem1;
  //     $scope.navItem = $scope.chooseNavItem1;
  //    }
  //    $scope.closeThisDialog1();
  // }

}])
app.controller("heardNavController",["$scope","$http","$state","$cookieStore","$window",function($scope,$http,$state,$cookieStore,$wid){
  $scope.logOff=function(){
    $http.get("/api/v1/authentication/logout").then(function(data){
      console.log(data);
    },function(err){
      console.log(data);
    });
    $wid.localStorage.Authorization="false";
    $state.go("access.signin");
  }
}])
