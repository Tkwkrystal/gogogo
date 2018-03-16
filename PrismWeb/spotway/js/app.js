'use strict';


// Declare app level module which depends on filters, and services
var app = angular.module('app', [
    'ngAnimate',
    'ngCookies',
    'ngStorage',
    'ui.tree',
    'ui.router',
    'ui.bootstrap',
    'ui.load',
    'ui.jq',
    'ui.validate',
    'pascalprecht.translate',
    'app.filters',
    'app.services',
    'app.directives',
    'app.controllers',
    'app.navtrees',
    'ngDialog',
    'app.user',
    'app.funAuth',
    'pingAnServices',
    'pingAn_PcIndex',
    'pingAn_PcNorm',
    'pingAn_PcHoliday',
    'pingAn_PcBusiness',
    'pingAn_PcFinance',
    'pingAn_PcIndustry',
    'yuebao_yuedujingyingfenxiyuebao'
  ])
.run(
  [          '$rootScope', '$state', '$stateParams','$cookieStore','$http',"$location","$window",
    function ($rootScope,   $state,   $stateParams,$cookieStore,$http,$location,$wid) {
         $rootScope.$on('$stateChangeSuccess', function(){
            // if(!$wid.localStorage.Authorization){
            //      $state.go("access.signin");
            //      $location.path("/access/signin");
            // }
         })
    }
  ]
)
.config(
  [          '$stateProvider', '$urlRouterProvider', '$controllerProvider', '$compileProvider', '$filterProvider', '$provide','$httpProvider',
    function ($stateProvider,   $urlRouterProvider,   $controllerProvider,   $compileProvider,   $filterProvider,   $provide,$httpProvider) {
        
        // lazy controller, directive and service
        app.controller = $controllerProvider.register;
        app.directive  = $compileProvider.directive;
        app.filter     = $filterProvider.register;
        app.factory    = $provide.factory;
        app.service    = $provide.service;
        app.constant   = $provide.constant;
        app.value      = $provide.value;

        $urlRouterProvider
            // .otherwise('/app/dashboard');
            .otherwise('/access/signin');
        $stateProvider            
            .state('app', {
                abstract: true,
                url: '/app',
                templateUrl: 'tpl/app.html'
            })
            .state('app.dashboard', {
                url: '/dashboard',
                templateUrl: 'tpl/app_dashboard.html'
            })
            .state('app.userConfig',{
                url:'/user',
                templateUrl:'tpl/user/userConfig.html'
            })
            .state('app.userGroup',{
                url:'/userGroup',
                templateUrl:'tpl/user/userGroupConfig.html'
            })
            .state('app.userNews',{
                url:'/userNews',
                templateUrl:'tpl/user/userNews.html'
            })
            .state('app.funAuth',{
                url:'/funAuth',
                templateUrl:'tpl/funAuth/funAuth.html' 
            })
            .state('app.echartMap',{
                url:'/echartMap',
                templateUrl:'tpl/echartMap/echartMap.html',
            })
            // .state('app.pingAn',{
            //     url:'/pingAn',
            //     // templateUrl: 'tpl/app.html'
            // })
            .state('app.pcIndex',{
                url:'/pcIndex',
                templateUrl:'tpl/pingAn/pcIndex.html',
            })
            .state('app.pcNorm',{
                url:'/pcNorm',
                templateUrl:'tpl/pingAn/pcNorm.html',
            })
            .state('app.pcHoliday',{
                url:'/pcHoliday',
                templateUrl:'tpl/pingAn/pcHoliday.html',
            })
            .state('app.pcFinance',{
                url:'/pcFinance',
                templateUrl:'tpl/pingAn/pcFinance.html',
            })
            .state('app.pcBusiness',{
                url:'/pcBusiness',
                templateUrl:'tpl/pingAn/pcBusiness.html',
            })
            .state('app.pcIndustry',{
                url:'/pcIndustry',
                templateUrl:'tpl/pingAn/pcIndustry.html',
            })
            .state('app.yuedujingyingfenxiyuebao',{
                url:'/yuedujingyingfenxiyuebao',
                templateUrl:'tpl/yuebao/yuedujingyingfenxiyuebao.html',
            })
            .state('app.touhouxiangmuyuebao',{
                url:'/touhouxiangmuyuebao',
                templateUrl:'tpl/yuebao/touhouxiangmu.html',
            })
            .state('access', {
                url: '/access',
                template: '<div ui-view class="fade-in-right-big smooth"></div>'
            })
            .state('access.signin', {
                url: '/signin',
                templateUrl: 'tpl/page_signin.html'
            })
            .state('access.signup', {
                url: '/signup',
                templateUrl: 'tpl/page_signup.html'
            })
           
            $httpProvider.interceptors.push(["$q", "$window", function (e, t) {
                return {
                    request: function (n) {
                        return n.headers = n.headers || {},
                        t.localStorage.token && (n.headers.Authorization = "Bearer " + t.localStorage.token),
                        t.localStorage.deviceId && (n.headers["X-Device-Id"] = t.localStorage.deviceId),
                        n || e.when(n)
                    },
                    responseError: function (t) {
                      //  window.location.href = "/spotway/#/access/signin"
                    }
                }
            }]);
    }
  ]
)

app.directive('fileModel', ['$parse', function ($parse) {
    return {
        restrict: 'A',
        link: function (scope, element, attrs, ngModel) {
            var model = $parse(attrs.fileModel);
            var modelSetter = model.assign;
            element.bind('change', function (event) {
                scope.$apply(function () {
                    modelSetter(scope, element[0].files[0]);
                });
                //附件预览
                scope.file = (event.srcElement || event.target).files[0];
                scope.getFile();
            });
        }
    }
}])

app.factory('fileReader', ["$q", "$log", function($q, $log){
    var onLoad = function(reader, deferred, scope) {
        return function () {
            scope.$apply(function () {
                deferred.resolve(reader.result);
            });
        };
    };
    var onError = function (reader, deferred, scope) {
        return function () {
            scope.$apply(function () {
                deferred.reject(reader.result);
            });
        };
    };
    var getReader = function(deferred, scope) {
        var reader = new FileReader();
        reader.onload = onLoad(reader, deferred, scope);
        reader.onerror = onError(reader, deferred, scope);
        return reader;
    };
    var readAsDataURL = function (file, scope) {
        var deferred = $q.defer();
        var reader = getReader(deferred, scope);
        reader.readAsDataURL(file);
        return deferred.promise;
    };
    return {
        readAsDataUrl: readAsDataURL
    };
}])
.config(['$translateProvider', function($translateProvider){
  var lang = window.localStorage.lang||'cn';
  window.localStorage.lang?window.localStorage.lang:window.localStorage.lang="cn";
  $translateProvider.preferredLanguage(lang);
  $translateProvider.useStaticFilesLoader({
      prefix: '/spotway/l10n/',
      suffix: '.json'
  });
}])

/**
 * jQuery plugin config use ui-jq directive , config the js and css files that required
 * key: function name of the jQuery plugin
 * value: array of the css js file located
 */
.constant('JQ_CONFIG', {
        china:['js/china.js'],
    easyPieChart:   ['js/jquery/charts/easypiechart/jquery.easy-pie-chart.js'],
    sparkline:      ['js/jquery/charts/sparkline/jquery.sparkline.min.js'],
    plot:           ['js/jquery/charts/flot/jquery.flot.min.js', 
                        'js/jquery/charts/flot/jquery.flot.resize.js',
                        'js/jquery/charts/flot/jquery.flot.tooltip.min.js',
                        'js/jquery/charts/flot/jquery.flot.spline.js',
                        'js/jquery/charts/flot/jquery.flot.orderBars.js',
                        'js/jquery/charts/flot/jquery.flot.pie.min.js'],
    slimScroll:     ['js/jquery/slimscroll/jquery.slimscroll.min.js'],
    sortable:       ['js/jquery/sortable/jquery.sortable.js'],
    nestable:       ['js/jquery/nestable/jquery.nestable.js',
                        'js/jquery/nestable/nestable.css'],
    filestyle:      ['js/jquery/file/bootstrap-filestyle.min.js'],
    slider:         ['js/jquery/slider/bootstrap-slider.js',
                        'js/jquery/slider/slider.css'],
    chosen:         ['js/jquery/chosen/chosen.jquery.min.js',
                        'js/jquery/chosen/chosen.css'],
    TouchSpin:      ['js/jquery/spinner/jquery.bootstrap-touchspin.min.js',
                        'js/jquery/spinner/jquery.bootstrap-touchspin.css'],
    wysiwyg:        ['js/jquery/wysiwyg/bootstrap-wysiwyg.js',
                        'js/jquery/wysiwyg/jquery.hotkeys.js'],
    dataTable:      ['js/jquery/datatables/jquery.dataTables.min.js',
                        'js/jquery/datatables/dataTables.bootstrap.js',
                        'js/jquery/datatables/dataTables.bootstrap.css'],
    vectorMap:      ['js/jquery/jvectormap/jquery-jvectormap.min.js', 
                        'js/jquery/jvectormap/jquery-jvectormap-world-mill-en.js',
                        'js/jquery/jvectormap/jquery-jvectormap-us-aea-en.js',
                        'js/jquery/jvectormap/jquery-jvectormap.css'],
    footable:       ['js/jquery/footable/footable.all.min.js',
                        'js/jquery/footable/footable.core.css']
    }
)


.constant('MODULE_CONFIG', {
    select2:        ['js/jquery/select2/select2.css',
                        'js/jquery/select2/select2-bootstrap.css',
                        'js/jquery/select2/select2.min.js',
                        'js/modules/ui-select2.js']
    }
)
;