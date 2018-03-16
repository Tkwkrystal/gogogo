/**
 * Created by Administrator on 2017/11/22.
 */
/*
'use strict';
var app=angular.module('pingAn_PcInsurance', ['pingAnServices','ngDialog','app.services']);
app.controller('pingAnInsuranceController',['$scope',"$http","pingAnDataServices","pcInsuranceFactory",function ($scope,$http,pingAnDataServices,pcInsuranceFactory) {
    pingAnDataServices.getData(pcInsuranceFactory.real_investment,pcInsuranceFactory.address).then(function(data){
        // console.log(data.values);
        $scope.pFont=(data.values[0].data/10000).toFixed(2)
    })
    pingAnDataServices.getData(pcInsuranceFactory.table,pcInsuranceFactory.address).then(function(data){
        // console.log(data.values);
        // $(".bodyerTable tbody").empty();
        var array = data.values;
        $.each(array, function (i, item) {
            var tr = $("<tr><td>" + array[i][0].data + "</td><td>" + (array[i][1].data).substr(0,10) + "</td><td>" + array[i][2].data + "</td><td>" + array[i][3].data + "</td><td>" + (array[i][4].data/10000).toFixed(2) + "</td></tr>");
            $(".tBodyer").append(tr);
        });
    })
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
                axisLabel: {
                 show: true,
                 textStyle: {
                 color: 'red'
                 }
                 },
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
*/
