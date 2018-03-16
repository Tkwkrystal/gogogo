'use strict';
var app = angular.module('yuebao_yuedujingyingfenxiyuebao', ['pingAnServices', 'ngDialog', 'app.services']);
app.controller('yuebao_yuedujingyingfenxiyuebao', ['$scope', "$http","$timeout", "pingAnDataServices", "pcBusinessFactory","tableHeaderHelper", function($scope,$http, $timeout,pingAnDataServices, pcBusinessFactory, tableHeaderHelper) {


    // 商业投资，投资，资管的切换事件
    $scope.contentChanges = false;
    $scope.contentChanges1 = true;
    $scope.contentChanges2 = true;
    $scope.contentChanges3 = true;
    // $scope.normChanges=false;
    // $scope.normChanges1=true;
    $scope.firstLi = function() {
        $scope.contentChanges = false;
        $scope.contentChanges1 = true;
        $scope.contentChanges2 = true;
        $scope.contentChanges3 = true;
        $("#right1").addClass("liActive").siblings().removeClass("liActive");

    };
    $scope.secondLi = function() {
        $scope.contentChanges = true;
        $scope.contentChanges1 = false;
        $scope.contentChanges2 = true;
        $scope.contentChanges3 = true;
        $("#right2").addClass("liActive").siblings().removeClass("liActive");

    };

    $scope.thirdLi = function() {
        $scope.contentChanges = true;
        $scope.contentChanges1 = true;
        $scope.contentChanges2 = false;
        $scope.contentChanges3 = true;
        $("#right3").addClass("liActive").siblings().removeClass("liActive");

    };
    $scope.fouthLi = function() {
        $scope.contentChanges = true;
        $scope.contentChanges1 = true;
        $scope.contentChanges2 = true;
        $scope.contentChanges3 = false;
        $("#right4").addClass("liActive").siblings().removeClass("liActive");
    };




    $scope.changeNum = 1;

    $scope.changeNumFunc = function () {
        $scope.changeNum = -$scope.changeNum;
        $('#ulUp').animate({right:'1250px'},"slow");
        $('#ulUp').html("");
        $('#ulDown').html("");
        $('#addCircleLine').html("");

        circleline();
    }
    var circleline = function() {
        var count = 15;
        var day = 30;
        var i = 0;
        var changeNum = $scope.changeNum;
        if(count>10){
            if(changeNum==1){
                count = 10;
            }else{
                i=10;
            }
        }

        for(i;i<count;i++){
            if(i%2==0){
                if(i==0||i==10){
                    var addUlUp =  '<li style="margin-left: 11%;float: left;" class="li_margin_left">'+
                        '计划：2018-3-5<br>'+
                        '实际：2018-3-5<br>'+
                        '偏差：2018-3-5<br>'+
                        '<b>取得《建设用地规划许可证》</b><br>'+
                        '</li>';
                }else{
                    var addUlUp = '<li style="float: left;" class="li_margin_left">'+
                        '计划：2018-3-5<br>'+
                        '实际：2018-3-5<br>'+
                        '偏差：2018-3-5<br>'+
                        '<b>开工</b><br>'+
                        '</li>';
                }
                document.getElementById("ulUp").innerHTML += addUlUp;
            }else{
                if(i==1 || i==11){
                    var addUlDown =  '<li style="margin-left: 19%;float: left;margin-top: -10px" class="li_margin_left">'+
                        '<b>取得《建设用地规划许可证》</b><br>'+
                        '计划：2018-3-5<br>'+
                        '实际：2018-3-5<br>'+
                        '偏差：<br>'+
                        '</li>';
                }else{
                    var addUlDown = '<li style="float: left;margin-top: -10px" class="li_margin_left">'+
                        '<b>开工</b><br>'+
                        '计划：2018-3-5<br>'+
                        '实际：2018-3-5<br>'+
                        '偏差：<br><br>'+
                        '</li>';
                }
                document.getElementById("ulDown").innerHTML += addUlDown;
            }
            if(day==null){
                var addLine = '<label class="circleclass" style="border: 1px solid grey"></label>';
                document.getElementById("addCircleLine").innerHTML += addLine;
                continue;
            }
            else if(day<=30){
                var addLine = '<label class="circleclass" style="border: 1px solid green;background-color: green"></label>';
                document.getElementById("addCircleLine").innerHTML += addLine;
                continue;
            }
            else if(day<=60){
                var addLine = '<label class="circleclass" style="border: 1px solid purple"></label>';
                document.getElementById("addCircleLine").innerHTML += addLine;
                continue;
            }
            else if(day<=90){
                var addLine = '<label class="circleclass" style="border: 1px solid orange"></label>';
                document.getElementById("addCircleLine").innerHTML += addLine;
                continue;
            }
            else if(day>90){
                var addLine = '<label class="circleclass" style="border: 1px solid red"></label>';
                document.getElementById("addCircleLine").innerHTML += addLine;
                continue;
            }

        }

    };
    circleline();


    $(".liebiao").click(function (event) {
        $(this).children('ul').show();
        $('.dierji').hide();
        $(this).siblings().children('ul').hide();
        event.stopPropagation();
    })
    $(".liebiao1").click(function (event) {
        $(this).children('ul').show();
        $(this).siblings().children('ul').hide();
        event.stopPropagation();
    })

    $(".erji1").click(
        function (event) {
            $('.diyiji').hide();
            $('.dierji').hide();
            $('#quyu').text($(this).text());
            event.stopPropagation();


        })

    $(".erji2").click(
        function (event) {
            $('.diyiji').hide();
            $('.dierji').hide();
            $('#xiangmu').text($(this).text());
            event.stopPropagation();


        })
    $(".erji3").click(
        function (event) {
            $('.diyiji').hide();
            $('.dierji').hide();
            $('#nianyue').text($(this).parents(".dierji").siblings("a").text() + $(this).text());
            event.stopPropagation();


        })
    $('body').bind('click', function(event) {

        $('.diyiji').hide();
        $('.dierji').hide();

    });



}])


app.controller('xiangmuPieTu', ["$scope","$http", "pingAnDataServices", "pcBusinessFactory", "pingAnDataServices", "pcBusinessFactory", function($scope, $http, pingAnDataServices, pcBusinessFactory) {
    var worLdMapContainer = document.getElementById('xiangmuPieTu')

    var mapChart = echarts.init(worLdMapContainer);


    var option = {
        title : {
            // text: '某站点用户访问来源',
            // subtext: '纯属虚构',
            // x:'center'
        },
        tooltip : {
            trigger: 'item',
            formatter: "{a} <br/>{b} : {c} ({d}%)"
        },
        // legend: {
        //     orient: 'vertical',
        //     left: 'left',
        //     data: ['直接访问','邮件营销','联盟广告','视频广告','搜索引擎']
        // },
        series : [
            {
                name: '访问来源',
                type: 'pie',
                radius: ['40%', '60%'],
                center: ['50%', '50%'],
                data:[
                    {value:335, name:'直接访问'},
                    {value:310, name:'邮件营销'},
                    {value:234, name:'联盟广告'},
                    {value:135, name:'视频广告'},
                    {value:1548, name:'搜索引擎'}
                ],
                itemStyle: {
                    emphasis: {
                        shadowBlur: 10,
                        shadowOffsetX: 0,
                        shadowColor: 'rgba(0, 0, 0, 0.5)'
                    }
                }
            }
        ]
    };
    mapChart.setOption(option);


}]);
app.controller('zongtixiaoshoumianji', ["$scope","$http", "pingAnDataServices", "pcBusinessFactory", "pingAnDataServices", "pcBusinessFactory", function($scope, $http, pingAnDataServices, pcBusinessFactory) {
    var worLdMapContainer = document.getElementById('zongtixiaoshoumianji')

    var mapChart = echarts.init(worLdMapContainer);


    var option = {
        title : {
            // text: '某站点用户访问来源',
            // subtext: '纯属虚构',
            // x:'center'
        },
        tooltip : {
            trigger: 'item',
            formatter: "{a} <br/>{b} : {c} ({d}%)"
        },
        // legend: {
        //     orient: 'vertical',
        //     left: 'left',
        //     data: ['直接访问','邮件营销','联盟广告','视频广告','搜索引擎']
        // },
        series : [
            {
                name: '访问来源',
                type: 'pie',
                radius: ['40%', '60%'],
                center: ['50%', '50%'],
                data:[
                    {value:335, name:'直接访问'},
                    {value:310, name:'邮件营销'},
                    {value:234, name:'联盟广告'},
                    {value:135, name:'视频广告'},
                    {value:1548, name:'搜索引擎'}
                ],
                itemStyle: {
                    emphasis: {
                        shadowBlur: 10,
                        shadowOffsetX: 0,
                        shadowColor: 'rgba(0, 0, 0, 0.5)'
                    }
                }
            }
        ]
    };
    mapChart.setOption(option);


}]);
app.controller('zongtixiaoshoujine', ["$scope","$http", "pingAnDataServices", "pcBusinessFactory", "pingAnDataServices", "pcBusinessFactory", function($scope, $http, pingAnDataServices, pcBusinessFactory) {
    var worLdMapContainer = document.getElementById('zongtixiaoshoujine')

    var mapChart = echarts.init(worLdMapContainer);


    var option = {
        title : {
            // text: '某站点用户访问来源',
            // subtext: '纯属虚构',
            // x:'center'
        },
        tooltip : {
            trigger: 'item',
            formatter: "{a} <br/>{b} : {c} ({d}%)"
        },
        // legend: {
        //     orient: 'vertical',
        //     left: 'left',
        //     data: ['直接访问','邮件营销','联盟广告','视频广告','搜索引擎']
        // },
        series : [
            {
                name: '访问来源',
                type: 'pie',
                radius: ['40%', '60%'],
                center: ['50%', '50%'],
                data:[
                    {value:335, name:'直接访问'},
                    {value:310, name:'邮件营销'},
                    {value:234, name:'联盟广告'},
                    {value:135, name:'视频广告'},
                    {value:1548, name:'搜索引擎'}
                ],
                itemStyle: {
                    emphasis: {
                        shadowBlur: 10,
                        shadowOffsetX: 0,
                        shadowColor: 'rgba(0, 0, 0, 0.5)'
                    }
                }
            }
        ]
    };
    mapChart.setOption(option);


}]);
app.controller('xiaoshoumianji', ["$scope","$http", "pingAnDataServices", "pcBusinessFactory", "pingAnDataServices", "pcBusinessFactory", function($scope, $http, pingAnDataServices, pcBusinessFactory) {
    var worLdMapContainer = document.getElementById('xiaoshoumianji')

    var mapChart = echarts.init(worLdMapContainer);


    var option = {

        xAxis: {
            type: 'category',
            data: ['Mon', 'Tue', 'Wed']
        },
        yAxis: {
            type: 'value'
        },
        series: [{
            data: [120, 200, 150],
            type: 'bar',
            itemStyle: {
                //通常情况下：
                normal:{
                    //每个柱子的颜色即为colorList数组里的每一项，如果柱子数目多于colorList的长度，则柱子颜色循环使用该数组
                    color: function (params){
                        var colorList = ['rgb(164,205,238)','rgb(42,170,227)','rgb(25,46,94)','rgb(195,229,235)'];
                        return colorList[params.dataIndex];
                    }
                },
                //鼠标悬停时：
                emphasis: {
                    shadowBlur: 10,
                    shadowOffsetX: 0,
                    shadowColor: 'rgba(0, 0, 0, 0.5)'
                }
            },
        }]

    };
    mapChart.setOption(option);


}]);
app.controller('xiaoshoushouru', ["$scope","$http", "pingAnDataServices", "pcBusinessFactory", "pingAnDataServices", "pcBusinessFactory", function($scope, $http, pingAnDataServices, pcBusinessFactory) {
    var worLdMapContainer = document.getElementById('xiaoshoushouru')

    var mapChart = echarts.init(worLdMapContainer);


    var option = {

        xAxis: {
            type: 'category',
            data: ['Mon', 'Tue', 'Wed']
        },
        yAxis: {
            type: 'value'
        },
        series: [{
            data: [120, 200, 150],
            type: 'bar',
            itemStyle: {
                //通常情况下：
                normal:{
                    //每个柱子的颜色即为colorList数组里的每一项，如果柱子数目多于colorList的长度，则柱子颜色循环使用该数组
                    color: function (params){
                        var colorList = ['rgb(164,205,238)','rgb(42,170,227)','rgb(25,46,94)','rgb(195,229,235)'];
                        return colorList[params.dataIndex];
                    }
                },
                //鼠标悬停时：
                emphasis: {
                    shadowBlur: 10,
                    shadowOffsetX: 0,
                    shadowColor: 'rgba(0, 0, 0, 0.5)'
                }
            },
        }]

    };
    mapChart.setOption(option);


}]);
app.controller('xiaoshoujiage', ["$scope","$http", "pingAnDataServices", "pcBusinessFactory", "pingAnDataServices", "pcBusinessFactory", function($scope, $http, pingAnDataServices, pcBusinessFactory) {
    var worLdMapContainer = document.getElementById('xiaoshoujiage')

    var mapChart = echarts.init(worLdMapContainer);


    var option = {

        xAxis: {
            type: 'category',
            data: ['Mon', 'Tue', 'Wed']
        },
        yAxis: {
            type: 'value'
        },
        series: [{
            data: [120, 200, 150],
            type: 'bar',
            itemStyle: {
                //通常情况下：
                normal:{
                    //每个柱子的颜色即为colorList数组里的每一项，如果柱子数目多于colorList的长度，则柱子颜色循环使用该数组
                    color: function (params){
                        var colorList = ['rgb(164,205,238)','rgb(42,170,227)','rgb(25,46,94)','rgb(195,229,235)'];
                        return colorList[params.dataIndex];
                    }
                },
                //鼠标悬停时：
                emphasis: {
                    shadowBlur: 10,
                    shadowOffsetX: 0,
                    shadowColor: 'rgba(0, 0, 0, 0.5)'
                }
            },
        }]

    };
    mapChart.setOption(option);


}]);
