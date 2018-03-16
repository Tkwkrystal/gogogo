'use strict';

/* Controllers */




angular.module('app.controllers', ['pascalprecht.translate', 'ngCookies', 'app.services','ui.tree'])
  .controller('AppCtrl', ['$scope', '$translate', '$localStorage', '$window', 
    function(              $scope,   $translate,   $localStorage,   $window ) {
      // add 'ie' classes to html
      var isIE = !!navigator.userAgent.match(/MSIE/i);
      isIE && angular.element($window.document.body).addClass('ie');
      isSmartDevice( $window ) && angular.element($window.document.body).addClass('smart');
      // config
      $scope.app = {
        name: 'SpotView',
        version: '1.1.3',
        // for chart colors
        color: {
          primary: '#7266ba',
          info:    '#23b7e5',
          success: '#27c24c',
          warning: '#fad733',
          danger:  '#f05050',
          light:   '#e8eff0',
          dark:    '#3a3f51',
          black:   '#1c2b36'
        },
        settings: {
          themeID: 1,
          navbarHeaderColor: 'bg-black',
          navbarCollapseColor: 'bg-white-only',
          asideColor: 'bg-black',
          headerFixed: true,
          asideFixed: false,
          asideFolded: false
        }
      }

      // save settings to local storage
      if ( angular.isDefined($localStorage.settings) ) {
        $scope.app.settings = $localStorage.settings;
      } else {
        $localStorage.settings = $scope.app.settings;
      }
      $scope.$watch('app.settings', function(){ $localStorage.settings = $scope.app.settings; }, true);

      // angular translate
      $scope.lang = { isopen: false };
      $scope.langs = {en:'English', de_DE:'German', it_IT:'Italian'};
      $scope.selectLang = $scope.langs[$translate.proposedLanguage()] || "English";
      $scope.setLang = function(langKey, $event) {
        // set the current lang
        $scope.selectLang = $scope.langs[langKey];
        // You can change the language during runtime
        $translate.use(langKey);
        $scope.lang.isopen = !$scope.lang.isopen;
      };

      function isSmartDevice( $window )
      {
          // Adapted from http://www.detectmobilebrowsers.com
          var ua = $window['navigator']['userAgent'] || $window['navigator']['vendor'] || $window['opera'];
          // Checks for iOs, Android, Blackberry, Opera Mini, and Windows mobile devices
          return (/iPhone|iPod|iPad|Silk|Android|BlackBerry|Opera Mini|IEMobile/).test(ua);
      };
				//$scope.app.settings.asideFolded=false;
        if($scope.app.settings.asideFolded==true){
        	$scope.app.settings.asideFolded=false
        }
        $scope.showNav=function(){
            $scope.app.settings.asideFolded = !$scope.app.settings.asideFolded;
            $scope.showMassages=!$scope.showMassages;
      }
  }])
  



  // signin controller
  .controller('SigninFormController', ['$scope', '$http', '$state','$cookieStore','$interval','$window','$localStorage', '$translate','$rootScope','userHelper',function($scope, $http, $state,$cookieStore,$interval, $wid,$localStorage,$translate,$rootScope,userHelper) {
    $scope.user = {};
    $scope.authError = null;
    $scope.enterEvent = function(e) {
        var keycode = window.event?e.keyCode:e.which;
        if(keycode==13){
            $scope.login();
        }
    }
      $scope.login = function () {    //登录
          if (!$scope.loading && $scope.username && $scope.password) {
              $scope.loading = !0;
              var data = {
                      username: $scope.username,
                      password: $scope.password,
                      isPersistent: $scope.rememberMe
                      // localeId: $device.locale()
                  },
                  src = $state.src;
              jQuery.post("../../kingdee/KingdeeHandler.ashx", {
                      username: $scope.username,
                      password: $scope.password,
                      Type: "checkumuser"
                  }, function (res, textStatus) {
                      // if (res != null) {
                      //     var objData = JSON.parse(res);
                      //     if (objData.Success) {
                      //         $http.post("/api/auth/login?src=" + encodeURIComponent(src), data).success(function (response, status, headers, config) {
                      //             if($device.phone()&&$(".btn-save").is(':checked')){
                      //                 localStorage.setItem("user",$scope.username);
                      //                 localStorage.setItem("pwd",$scope.password);
                      //             }
                      //             $scope.redirectUrl = response.src,   //进入到主页面
                      //                 $timeout(function () {
                      //                     $("#login").submit()    //表单提交
                      //                 })
                      //         }).error(function (response, status, headers, config) {
                      //             switch ($scope.loading = !1, status) {
                      //                 case 401:
                      //                     $scope.error = "account.login.err.wronguserpass";
                      //                     break;
                      //                 case 405:
                      //                     $scope.error = "account.login.err.ldapconnection";
                      //                     break;
                      //                 case 406:
                      //                     $scope.error = "account.login.err.ldapdisabled";
                      //                     break;
                      //                 default:
                      //                     $scope.error = "account.login.err.generalErr"
                      //             }
                      //         })
                      //     }
                      //     else {
                      //        $scope.loading = !1;
                      //        $scope.error = "登陆失败：" + objData.msg;
                      //     }
                      // }
                      if(res != null){
                          var objData = JSON.parse(res);
                          if (objData.Success) {
                              $http.get("/api/auth/wx/"+objData.Data).success(function(response, status, headers, config){
                                  console.log(response);
                                  $http.post('/api/v1/authentication/login', {'username': response, 'password': "qwer1234!",'localeId':'zh-CN'})
                                      .then(function (response,status) {
                                          if(!response){
                                              $scope.error1 = '用户名或密码错误!';
                                          }else{
                                              $scope.$root.userId=response.data.userId;
                                              $scope.$root.token=response.data.access_token;
                                              $cookieStore.put(".deviceId",$localStorage.deviceId);
                                              $wid.sessionStorage.userId=response.data.userId;
                                              $wid.sessionStorage.token=response.data.access_token;
                                              $wid.sessionStorage.Authorization = "Bearer " + response.data.access_token;
                                              userHelper.getUser(response.data.userId).then(function(user){
                                                  $rootScope.user=user;
                                                  if(user.groups==null){
                                                      $state.go("app.dashboard");
                                                  }
                                                  for(var j=0;j<user.groups.length;j++){
                                                      userHelper.userGroup(user.groups[j]).then(function(group){
                                                          if(group.pageIndex){
                                                              $state.go(group.pageIndex);
                                                              return ;
                                                          }else{
                                                              $state.go("app.dashboard");
                                                          }
                                                      })
                                                  }

                                              })

                                          }
                                      }, function (x) {
                                          $scope.error1 = '用户名或密码错误!';
                                      });
                                  // $scope.redirectUrl = "/app/main#/home";
                                  // window.location.reload();
                                  // window.location.href="/app/main#/home";
                              }).error(function (response, status, headers, config) {
                                  switch ($scope.loading = !1, status) {
                                      case 401:
                                          $scope.error = "account.login.err.wronguserpass";
                                          break;
                                      case 405:
                                          $scope.error = "account.login.err.ldapconnection";
                                          break;
                                      case 406:
                                          $scope.error = "account.login.err.ldapdisabled";
                                          break;
                                      default:
                                          $scope.error = "account.login.err.generalErr"
                                  }
                              })
                          }else{
                              $scope.loading = !1;
                              $scope.error = "UM验证错误：" + objData.msg;
                          }

                      }else{
                          $scope.loading = !1;
                          $scope.error = "UM验证错误：" + objData.msg;
                      }
                  }
              );

          }
      };
      // $scope.login = function() {
      //     $scope.authError = null;
      //     $wid.sessionStorage.deviceId=$scope.c();
      //     //    $http.get()
      //     // Try to login
      //     $http.post('/api/v1/authentication/login', {'username': $scope.username, 'password': $scope.password,'localeId':'zh-CN'})
      //         .then(function (response,status) {
      //             if(!response){
      //                 $scope.error1 = '用户名或密码错误!';
      //             }else{
      //                 $scope.$root.userId=response.data.userId;
      //                 $scope.$root.token=response.data.access_token;
      //                 $cookieStore.put(".deviceId",$localStorage.deviceId);
      //                 $wid.sessionStorage.userId=response.data.userId;
      //                 $wid.sessionStorage.token=response.data.access_token;
      //                 $wid.sessionStorage.Authorization = "Bearer " + response.data.access_token;
      //                 userHelper.getUser(response.data.userId).then(function(user){
      //                     $rootScope.user=user;
      //                     if(user.groups==null){
      //                         $state.go("app.dashboard");
      //                     }
      //                     for(var j=0;j<user.groups.length;j++){
      //                         userHelper.userGroup(user.groups[j]).then(function(group){
      //                             if(group.pageIndex){
      //                                 $state.go(group.pageIndex);
      //                                 return ;
      //                             }else{
      //                                 $state.go("app.dashboard");
      //                             }
      //                         })
      //                     }
      //
      //                 })
      //
      //             }
      //         }, function (x) {
      //             $scope.error1 = '用户名或密码错误!';
      //         });
      //
      // };
    $scope.selectLang = function(lang){
        $translate.use(lang);
        window.localStorage.lang = lang;
    };
    $scope.lang = $translate.use();

    $scope.l = function () { return Math.floor(65536 * (1 + Math.random())).toString(16).substring(1) },
    $scope.c = function () { return $scope.l() + $scope.l() + "-" + $scope.l() + "-" + $scope.l() + "-" + $scope.l() + "-" + $scope.l() + $scope.l() + $scope.l() },
        $scope.fnBack=function () {
            $scope.myhide=false
        };
      $scope.fn=function () {
          $scope.myhide=!$scope.myhide
      };
      // $scope.fn1=function () {
      //
      //    $scope.myhide1=!$scope.myhide1
      // };
      // $scope.fn2=function () {
      //     $scope.myhide2=!$scope.myhide2
      // };
      // $scope.fn3=function () {
      //     $scope.myhide3=!$scope.myhide3
      // };
      // $scope.fn4=function () {
      //     $scope.myhide4=!$scope.myhide4
      // };
      // $scope.fn5=function () {
      //     $scope.myhide5=!$scope.myhide5;
      //     $scope.myhide=!$scope.myhide
      // };
      $scope.error2='请输入正确的手机或邮箱';
      $scope.error3='输入的手机验证码有误';
      $scope.error4='输入的邮箱验证码有误';
      $scope.error5='密码输入不一致';
      $scope.error6='此处必须填写';
      $scope.phoneValue='获取验证码';
      $scope.mialValue='获取验证码';
      $scope.think=false;
      $scope.think1=false;

      $scope.phoneMailChange=function (phoneMailData) {
          if(phoneMailData.indexOf("@")!=-1 && phoneMailData!=null){
              var str=/^[(a-z)|(0-9)]+@([(a-z)|(0-9)]+(\.))(com|cn|net|org)$/;
              var exg=str.test(phoneMailData);
              exg? $scope.testCheck=false: $scope.testCheck=true;
          }else{
              var str=/^1(3|4|5|7|8)\d{9}$/;
              var exg=str.test(phoneMailData);
              exg? $scope.testCheck=false: $scope.testCheck=true;
          };
      };

      $scope.timer=null;
      $scope.second=61;
      $interval.cancel($scope.timer);
      $scope.phoneClick=function () {
          $scope.think=true;
          $scope.timer=$interval(function () {
              $scope.second--;
              if($scope.second>0){
                  $scope.phoneValue='还剩余'+$scope.second+'S';
              }
              else{
                  $scope.phoneValue='重新获取';
                  $scope.think=false;
                  $interval.cancel($scope.timer);
                  $scope.second=61;
              }
          },1000);
      }

      $scope.timer1=null;
      $scope.second1=61;
      $interval.cancel($scope.timer1);
      $scope.mailClick=function () {
          $scope.think1=true;
          $scope.timer1=$interval(function () {
              $scope.second1--;
              if($scope.second1>0){
                  $scope.mialValue='还剩余'+$scope.second1+'S';
              }
              else{
                  $scope.mialValue='重新获取';
                  $scope.think1=false;
                  $interval.cancel($scope.timer1);
                  $scope.second1=61;
              }
          },1000);
      }


  }])


  // signup controller
  .controller('SignupFormController', ['$scope', '$http', '$state', function($scope, $http, $state) {
    $scope.user = {};
    $scope.authError = null;
    $scope.signup = function() {
      $scope.authError = null;
      // Try to create
      $http.post('api/signup', {name: $scope.user.name, email: $scope.user.email, password: $scope.user.password})
      .then(function(response) {
        if ( !response.data.user ) {
          $scope.authError = response;
        }else{
          $state.go('app.dashboard');
        }
      }, function(x) {
        $scope.authError = 'Server Error';
      });
    };
  }])

.controller('userNewsController',['$scope',function ($scope) {
    $scope.liContainShow=false;
    $scope.liContainShow1=false;
    $scope.liContainShow2=false;
    $scope.liContainShow3=false;
    $scope.liContainShow4=false;
    $scope.liContainShow5=false;
    $scope.wordsChange=function () {
        $(".userNewsBodyer1").show();
        $(".userNewsBodyer2").hide();
        $(".my_words").css("color","#f00");
        $(".my_comment").css("color","#51abe2")
    };
    $scope.commentChange=function () {
        $(".userNewsBodyer2").show();
        $(".userNewsBodyer1").hide();
        $(".my_words").css("color","#51abe2");
        $(".my_comment").css("color","#f00")
    };
    $scope.liContainChange=function () {
        $scope.liContainShow=!$scope.liContainShow;
    }
    $scope.liContainChange1=function () {
        $scope.liContainShow1=!$scope.liContainShow1;
    }
    $scope.liContainChange2=function () {
        $scope.liContainShow2=!$scope.liContainShow2;
    }
    $scope.liContainChange3=function () {
        $scope.liContainShow3=!$scope.liContainShow3;
    }
    $scope.liContainChange4=function () {
        $scope.liContainShow4=!$scope.liContainShow4;
    }
    $scope.liContainChange5=function () {
        $scope.liContainShow5=!$scope.liContainShow5;
    };
}])