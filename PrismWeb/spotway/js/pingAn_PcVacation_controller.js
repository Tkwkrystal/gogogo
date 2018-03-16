/**
 * Created by Administrator on 2017/11/22.
 */
'use strict';
var app=angular.module('pingAn_PcVacation', ['pingAnServices','ngDialog','app.services']);
app.controller('pingAnVacationController',['$scope',"$http","pingAnDataServices",function ($scope,$http,pingAnDataServices) {
    // KPI和权益的切换事件
    $scope.contentChanges=false;
    $scope.contentChanges1=true;
    $scope.firstLi=function () {
        $scope.contentChanges=false;
        $scope.contentChanges1=true;
        $(".firstLi").addClass("liActive").siblings().removeClass("liActive");
    };
    $scope.secondLi=function () {
        $scope.contentChanges=true;
        $scope.contentChanges1=false;
        $(".secondLi").addClass("liActive").siblings().removeClass("liActive");
    };
    // KPI点击事件
    $(".liBottom").each(function (index,ele) {
        $(ele).click(function () {
            $(".liBottom").removeClass("liBottomActive");
            $(this).addClass("liBottomActive");
        });
    });
    // 非KPI点击事件
    $(".liContent").each(function (index,ele) {
        $(ele).click(function () {
            $(".liContent").removeClass("liContentActive");
            $(this).addClass("liContentActive");
        });
    });


}])





















app.controller('echartColumnController',["$scope",function($scope){

    var mapChart = echarts.init(document.getElementById('container4'));
    var option = {
        title: {
            text: '',
            subtext: ''
        },
        tooltip: {
            trigger: 'axis',
            axisPointer: {
                type: 'shadow'
            }
        },
        legend: {
            // data: ['实际', '计划'],
            x:'center',
            y:'bottom',
            itemGap: 40,
            itemWidth: 8,
            itemHeight: 12,
            data:[
                {
                    name:'实际',
                    icon: 'image://./img/pingAnImg/fact.png',
                },{
                    name:'计划',
                    icon: 'image://./img/pingAnImg/plan.png',                    // textStyle:{color:'red'}
                }
            ],
        },
        grid: {
            left: '',
            right: '',
            bottom: '6%',
            top:'3%',
            containLabel: true
        },
        xAxis: {
            type: 'value',
            min:0,
            max:300,
            boundaryGap: [0, 0.2],
            splitNumber:5,
            splitLine:{
                show:false
            },
            axisLabel:{
                interval:0,//横轴信息全部显示
                rotate:30,//-30度角倾斜显示
            }
        },
        yAxis: {
            type: 'category',
            data: ['总部','深莞惠','安德','华中区','华南区','上海区','北方区','东南区','华西区','华东区'],
            splitNumber:1,
            splitLine:{
                show:true
            }
        },
        series: [
            {
                name: '实际',
                type: 'bar',
                data: [12, 7.25, 29.47, 101.22, 104.33, 130.27, 144.15, 193.81, 199.09, 201.93],
                markPoint : {
                    data : [
                        {name : '1', value : 1, xAxis: 12, yAxis: '总部'},
                        {name : '2', value : 1, xAxis: 7.25, yAxis: '深莞惠'},
                        {name : '3', value : 1, xAxis: 29.47, yAxis: '安德'},
                        {name : '4', value : 1, xAxis: 101.22, yAxis: '华中区'},
                        {name : '5', value : 1, xAxis: 104.33, yAxis: '华南区'},
                        {name : '6', value : 1, xAxis: 130.27, yAxis: '上海区'},
                        {name : '7', value : 1, xAxis: 144.15, yAxis: '北方区'},
                        {name : '8', value : 1, xAxis: 193.81, yAxis: '东南区'},
                        {name : '9', value : 1, xAxis: 199.09, yAxis: '华西区'},
                        {name : '10', value : 1, xAxis:201.93, yAxis: '华东区'}
                    ],
                    symbolSize:10,
                    itemStyle:{
                        normal:{
                            color:'#27B7E9',
                            label:{
                                show: true,
                                position: 'top',
                                formatter: function (param) {
                                    if (param.value == 1)
                                        return '';
                                    else
                                        return '';
                                }
                            }
                        }
                    }
                },
                label: {
                    normal: {
                        position: 'right',
                        show: true
                    }
                },
                //设置柱子的宽度
                barWidth : 8,
                itemStyle: {
                    //通常情况下：
                    normal:{
                        //每个柱子的颜色即为colorList数组里的每一项，如果柱子数目多于colorList的长度，则柱子颜色循环使用该数组
                        color: function (params){
                            var colorList = ['#27B7E9'];
                            return colorList[params.dataIndex];
                        }
                    },
                    //鼠标悬停时：
                    emphasis: {
                        shadowBlur: 10,
                        shadowOffsetX: 0,
                        shadowColor: 'red'
                    }
                },
            },
            {
                name: '计划',
                type: 'bar',
                data: [8, 5.58, 27.62, 71.42, 114.23, 108.31, 114.24, 150.82, 160.21, 165.52],
                markPoint : {
                    data : [
                        {name : '1', value : 0, xAxis: 8, yAxis: '总部'},
                        {name : '2', value : 0, xAxis: 5.58, yAxis: '深莞惠'},
                        {name : '3', value : 0, xAxis: 27.62, yAxis: '安德'},
                        {name : '4', value : 0, xAxis: 71.42, yAxis: '华中区'},
                        {name : '5', value : 0, xAxis: 114.23, yAxis: '华南区'},
                        {name : '6', value : 0, xAxis: 108.31, yAxis: '上海区'},
                        {name : '7', value : 0, xAxis: 114.24, yAxis: '北方区'},
                        {name : '8', value : 0, xAxis: 150.82, yAxis: '东南区'},
                        {name : '9', value : 0, xAxis: 160.21, yAxis: '华西区'},
                        {name : '10', value : 0, xAxis:165.52, yAxis: '华东区'}
                    ],
                    symbolSize:10,
                    itemStyle:{
                        normal:{
                            color:'#B86167',
                            label:{
                                show: true,
                                position: 'top',
                                formatter: function (param) {
                                    if (param.value == 1)
                                        return '';
                                    else
                                        return '';
                                }
                            }
                        }
                    }
                },
                //设置柱子的宽度
                barWidth : 8,
                label: {
                    normal: {
                        position: 'right',
                        show: true
                    }
                },
                itemStyle: {
                    //通常情况下：
                    normal:{
                        //每个柱子的颜色即为colorList数组里的每一项，如果柱子数目多于colorList的长度，则柱子颜色循环使用该数组
                        color: function (params){
                            var colorList = ['#B86167'];
                            return colorList[params.dataIndex];
                        }
                    },
                    //鼠标悬停时：
                    emphasis: {
                        shadowBlur: 10,
                        shadowOffsetX: 0,
                        shadowColor: 'red'
                    }
                },
            }
        ]
    };
    mapChart.setOption(option)
}])


app.controller('echartColumnController1',["$scope",function($scope){

    var mapChart = echarts.init(document.getElementById('container'));
    var option1 = {
        color: ['#3398DB'],
        tooltip : {
            trigger: 'axis',
            axisPointer : {            // 坐标轴指示器，坐标轴触发有效
                type : 'shadow'        // 默认为直线，可选为：'line' | 'shadow'
            }
        },
        grid: {
            left: '-30',
            right: '0',
            top:'0',
            bottom: '0',
            containLabel: true
        },
        xAxis : [
            {
                /*axisLabel: {
                 show: true,
                 textStyle: {
                 color: 'red'
                 }
                 },*/
                type : 'category',
                data : ['KPI', '实际'],
                axisTick: {
                    alignWithLabel: 0
                },
                splitLine:{
                    show:false
                },
            }
        ],
        yAxis : [
            {
                min:0,
                max:100,
                type : 'value',
                show:false,
                splitLine:{
                    show:false
                },
            }
        ],
        itemStyle: {
            //通常情况下：
            normal:{
                color:'#23B6E9',
            }
        },
        series : [
            {
                name:'value',
                type:'bar',
                barWidth: '20',
                data:[50, 80]
            }
        ]
    };
    mapChart.setOption(option1)
}])

app.controller('echartColumnController2',["$scope",function($scope){

    var mapChart = echarts.init(document.getElementById('container1'));
    var option1 = {
        color: ['#3398DB'],
        tooltip : {
            trigger: 'axis',
            axisPointer : {            // 坐标轴指示器，坐标轴触发有效
                type : 'shadow'        // 默认为直线，可选为：'line' | 'shadow'
            }
        },
        grid: {
            left: '-30',
            right: '0',
            top:'0',
            bottom: '0',
            containLabel: true
        },
        xAxis : [
            {
                type : 'category',
                data : ['KPI', '实际'],
                axisTick: {
                    alignWithLabel: 0
                },
                splitLine:{
                    show:false
                },
            }
        ],
        yAxis : [
            {
                min:0,
                max:100,
                type : 'value',
                show:false,
                splitLine:{
                    show:false
                },
            }
        ],
        itemStyle: {
            //通常情况下：
            normal:{
                color:'#EB5405',
            }
        },
        series : [
            {
                name:'value',
                type:'bar',
                barWidth: '20',
                data:[50, 80]
            }
        ]
    };
    mapChart.setOption(option1)
}])

app.controller('echartColumnController3',["$scope",function($scope){

    var mapChart = echarts.init(document.getElementById('container2'));
    var option1 = {
        color: ['#3398DB'],
        tooltip : {
            trigger: 'axis',
            axisPointer : {            // 坐标轴指示器，坐标轴触发有效
                type : 'shadow'        // 默认为直线，可选为：'line' | 'shadow'
            }
        },
        grid: {
            left: '-30',
            right: '0',
            top:'0',
            bottom: '0',
            containLabel: true
        },
        xAxis : [
            {
                type : 'category',
                data : ['KPI', '实际'],
                axisTick: {
                    alignWithLabel: 0
                },
                splitLine:{
                    show:false
                },
            }
        ],
        yAxis : [
            {
                min:0,
                max:100,
                type : 'value',
                show:false,
                splitLine:{
                    show:false
                },
            }
        ],
        itemStyle: {
            //通常情况下：
            normal:{
                color:'#EB5405',
            }
        },
        series : [
            {
                name:'value',
                type:'bar',
                barWidth: '20',
                data:[50, 80]
            }
        ]
    };
    mapChart.setOption(option1)
}])

app.controller('echartColumnController4',["$scope",function($scope){

    var mapChart = echarts.init(document.getElementById('container3'));
    var option1 = {
        color: ['#3398DB'],
        tooltip : {
            trigger: 'axis',
            axisPointer : {            // 坐标轴指示器，坐标轴触发有效
                type : 'shadow'        // 默认为直线，可选为：'line' | 'shadow'
            }
        },
        grid: {
            left: '-30',
            right: '0',
            top:'0',
            bottom: '0',
            containLabel: true
        },
        xAxis : [
            {
                type : 'category',
                data : ['KPI', '实际'],
                axisTick: {
                    alignWithLabel: 0
                },
                splitLine:{
                    show:false
                },
            }
        ],
        itemStyle: {
            //通常情况下：
            normal:{
                color:'#BA3D77',
            }
        },
        yAxis : [
            {
                min:0,
                max:100,
                type : 'value',
                show:false,
                splitLine:{
                    show:false
                },
            }
        ],
        series : [
            {
                name:'value',
                type:'bar',
                barWidth: '20',
                data:[50, 80],
            }
        ]
    };
    mapChart.setOption(option1)
}])
