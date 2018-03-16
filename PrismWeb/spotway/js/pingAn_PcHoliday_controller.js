/**
 * Created by Administrator on 2017/11/22.
 */
'use strict';
var app=angular.module('pingAn_PcHoliday', ['pingAnServices','ngDialog','app.services']);
app.service("appService", [function(){
    this.name="hello";
}]);
app.controller('pingAn_PcHoliday',['$scope',"$http","pingAnDataServices","pcIndexFactory", "tableHeaderHelper",function ($scope,$http,pingAnDataServices,pcIndexFactory, tableHeaderHelper) {
    $scope.bool2=true;
    $scope.tiaozhuan=function (projectName) {

        $scope.dashboards='/dashboards/58a6b2f7f7dcb5440400014a/';
        $scope.canshu='[{"jaql":{"table":"维度表_项目立项","column":"项目名称","dim":"[维度表_项目立项.项目名称]","datatype":"text","merged":true,"title":"项目名称","filter":{"members":["'+projectName+'"]}}}]';
        // $scope.canshu=encodeURI ($scope.canshu);
        console.log($scope.canshu);
        // $scope.filter=$scope.dashboards.concat($scope.canshu);
        // console.log($scope.filter);
        $http.post('/api/funAuth/otherVision',{'username': $scope.user.userName,'dashboards':$scope.dashboards,'canshu':$scope.canshu}).then(function(response,status){
            console.log(response);
            window.open(response.data,"_blank");
        })

        console.log('/api/funAuth/otherVision');
    }

    $scope.fanhuijiuban=function(){
        $scope.dashboards='/dashboards/58c91e08d296eb000900008d';
        $scope.canshu="";
        $http.post('/api/funAuth/otherVision',{'username': $scope.user.userName,'dashboards':$scope.dashboards,'canshu':$scope.canshu}).then(function(response,status){
            console.log(response);
            window.open(response.data,"_blank");
        })
    }


    $scope.func = function(header, body, el, hejix, factiaojian,tiaozhuan) {
        let thead = "",
            bodyx = {},
            hejiz={},
            tbodyx = "",
            htmlx = "",
            heji = "",
            y=0;
        for(let x = 0; x < header.length; x++) {
            header[x] = tableHeaderHelper.changeLine(header[x]);
            if(x==0){
                if(header[x].indexOf("（")>=0){

                    thead += "<td>" + (header[x] === "N\\A" ? "" : header[x].substring(0,header[x].indexOf("（"))) + "<span class='jiantou glyphicon glyphicon-chevron-down' style='color:gray;opacity:.5;width:20px;height:20px'></span></td>";
                }else{
                    thead += "<td>" + (header[x] === "N\\A" ? "" : header[x]) + "<span class='jiantou glyphicon glyphicon-chevron-down' style='color:gray;opacity:.5;width:20px;height:20px'></span></td>";
                }
            }else{
                if(header[x].indexOf("（")>=0){

                    thead += "<td>" + (header[x] === "N\\A" ? "" : header[x].substring(0,header[x].indexOf("（"))) + "</td>";
                }else{
                    thead += "<td>" + (header[x] === "N\\A" ? "" : header[x]) + "</td>";
                }
            }


            hejiz['heji' + x]=0;
            for(let z = 0; z < body.length; z++) {
                if(Number.isInteger(body[z][x].data)){
                    if(isNaN(body[z][x].data)) {
                        bodyx['tbody' + z] += "<td><a style='text-decoration:none' class='xiangxi'>" + body[z][x].data + "</a></td>"
                    } else {
                        try{
                            bodyx['tbody' + z] += "<td>" +body[z][x].data + "</td>";
                            hejiz['heji' + x]+=body[z][x].data*1;
                        }catch(err){
                            bodyx['tbody' + z] += "<td>" +body[z][x].data + "</td>";
                            hejiz['heji' + x]+=body[z][x].data*1;
                        }
                    }

                }else{
                    if(isNaN(body[z][x].data)) {
                        bodyx['tbody' + z] += "<td><a style='text-decoration:none' class='xiangxi'>" + body[z][x].data + "</a></td>"
                    } else {
                        try{
                            bodyx['tbody' + z] += "<td>" +body[z][x].data.toFixed(2) + "</td>";
                            hejiz['heji' + x]+=body[z][x].data*1;
                        }catch(err){
                            bodyx['tbody' + z] += "<td>" +body[z][x].data + "</td>";
                            hejiz['heji' + x]+=body[z][x].data*1;
                        }
                    }
                }
            }
        }
        thead = "<tr>" + thead + "</tr>";
        for(let z = 0; z < body.length; z++) {
            bodyx['tbody' + z] = "<tr>" + bodyx['tbody' + z] + "</tr>";
        }
        for(let z = 0; z < body.length; z++) {
            tbodyx += bodyx['tbody' + z];
        }
        for(let z = 1; z < header.length; z++) {
            if(Number.isInteger(hejiz['heji' + z])){
                heji+="<td style='color:#27ADFE'>" + hejiz['heji' + z] + "</td>"
            }else {
                heji+="<td style='color:#27ADFE'>" + hejiz['heji' + z].toFixed(2) + "</td>"
            }

        }
        heji="<tr><td style='color:#27ADFE'>合计</td>"+heji+"</tr>";
        //判断最后一行是否超出个数，防止被合计覆盖
        /*if($('tr').length>11){
            tbodyx +="<tr></tr>"
        }else{
            tbodyx=tbodyx
        }*/
        hejix ? tbodyx += heji : "";
        $(el).empty().append(thead + tbodyx);
        $(".xiangxi").each(function(indexx,objx){
            if(tiaozhuan){
                $(objx).click(function(){
                    $scope.tiaozhuan($(objx).text())
                })
            }else{
                $(objx).click(function(){
                    pcIndexFactory[factiaojian].metadata.pop();
                    pcIndexFactory[factiaojian].metadata.push(

                        {
                            "jaql": {
                                "dim": "[城市分公司-城市指标监控.城市分公司]",
                                "filter": {
                                    "members": [""+$(objx).text()+""]
                                }

                            }
                        }


                    );
                    pingAnDataServices.getData(pcIndexFactory[factiaojian], pcIndexFactory.address).then(function(data) {
                        function valx(){
                            let arr=[];
                            for(let x=0;x<data.values.length;x++){
                                arr.push(data.values[x].slice(0,data.values[0].length-1))
                            }
                            return arr
                        }
                        let lasttable=$(".tBodyerHoliday:first tr").clone(true);
                        $(".table_back").css("display","none")
                        $scope.func(data.headers.slice(0,data.headers.length-1), valx(), ".tBodyerHoliday:first", 1,null,1);
                        //$scope.func(data.headers, data.values, ".tBodyerHoliday:first", 1);
                        $(".table_back").css("display","inline").click(function(){
                            $(".tBodyerHoliday:first").empty().append(lasttable);
                            $(".table_back").css("display","none")
                        })
                    });
                })
            }

        })
        $(el).find("tr").each(function(index,obj){
            y=0;
            for(let x=1;x<$(obj).children("td").length;x++){
                if($(obj).children("td").eq(x).text()==="0.00"||$(obj).children("td").eq(x).text()==="-0.00"){
                    y++
                }
            }
            for(let x=0;x<$(obj).children("td").length;x++){
                if($(obj).children("td").eq(x).children().text()=="N\\A"){
                    $(obj).children("td").eq(x).children().text("—")
                }
            }
            if($(el).find("tr").eq(0).children("td:last").text()=="城市"){
                if(y==$(obj).children("td").length-2){
                    $(obj).remove()
                }
            }else{
                if(y==$(obj).children("td").length-1){
                    $(obj).remove()
                }
            }
        })
        $scope.functable(".tBodyerHoliday",1,factiaojian,false,tiaozhuan);

    }

    $scope.reversex={}
    $scope.functable=function(el,biaotou,factiaojian,pingjun,tiaozhuan){
        biaotou=biaotou||1;
        $(el).find("tr").eq(0).children().each(function(index,obj){
            $(obj).click(function(){
                let hejistring=$(el).find("tr").eq($(el).find("tr").length-1).prop("outerHTML");
                $(el).find("tr").eq($(el).find("tr").length-1).remove()
                //箭头方向
                $scope.reversex[index]=!$scope.reversex[index];
                $(".jiantou").remove();
                if($scope.reversex[index]){$(`<span class="jiantou glyphicon glyphicon-chevron-down" style="width:20px;height:20px"></span>`).appendTo($(obj))}
                else{$(`<span class="jiantou glyphicon glyphicon-chevron-up" style="width:20px;height:20px"></span>`).appendTo($(obj))}
                let namearr=[],indexarr=[],htmlx="";
                //添加排序内容
                var z=0;
                if(isNaN($(el).find("tr").eq(biaotou).children().eq(index).text())){
                    if($(el).find("tr").eq(biaotou).children().eq(index).text()==="/"){
                        for(var x=biaotou;x<$(el).find("tr").length;x++){
                            z++;
                            if($(el).find("tr").eq(x).children().eq(index).text()!=="/"){
                                namearr.push($(el).find("tr").eq(x).children().eq(index).text()*1+z/1000000)
                            }else{
                                namearr.push(0+z/1000000)
                            }
                        }
                    }else{
                        for(var x=biaotou;x<$(el).find("tr").length;x++){
                            namearr.push($(el).find("tr").eq(x).children().eq(index).text())
                        }
                    }
                    //namearr.push($(el).find("tr").eq(x).children().eq(index).text())
                }else{
                    for(var x=biaotou;x<$(el).find("tr").length;x++){
                        z++;
                        if($(el).find("tr").eq(x).children().eq(index).text()!=="/"){
                            namearr.push($(el).find("tr").eq(x).children().eq(index).text()*1+z/1000000)
                        }else{
                            namearr.push(0+z/1000000)
                        }
                        //namearr.push($(el).find("tr").eq(x).children().eq(index).text()*1+z/1000000);
                    }
                }
                //不是数字排序
                if(isNaN($(el).find("tr").eq(biaotou).children().eq(index).text())){
                    indexarr=[];let namearr1=[];
                    for(x of namearr){namearr1.push(x)}
                    if($scope.reversex[index]){namearr.sort();}else{namearr.sort().reverse();}
                    for(x of namearr){indexarr.push(namearr1.indexOf(x)+biaotou)};
                    //数字排序
                }else{
                    indexarr=[];let namearr1=[];
                    for(x of namearr){namearr1.push(x)}
                    if($scope.reversex[index]){namearr.sort((x,x1)=>x-x1);}else{namearr.sort((x,x1)=>x-x1).reverse();}
                    for(x of namearr){indexarr.push(namearr1.indexOf(x)+biaotou)};
                }
                for(var x=0;x<biaotou;x++){htmlx+=$(el).find("tr").eq(x).prop("outerHTML")}
                for(var x=0;x<indexarr.length;x++){htmlx+=$(el).find("tr").eq(indexarr[x]).prop("outerHTML")};
                htmlx+=hejistring;
                $(el).empty().append(htmlx);
                $scope.functable(el,biaotou,factiaojian,pingjun,tiaozhuan);
                $(".xiangxi").each(function(indexx,objx){
                    if(tiaozhuan){
                        $(objx).click(function(){
                            $scope.tiaozhuan($(objx).text())
                        })
                    }else{
                        $(objx).click(function(){
                            pcIndexFactory[factiaojian].metadata.pop();
                            pcIndexFactory[factiaojian].metadata.push({
                                "jaql": {
                                    "dim": "[城市分公司-城市指标监控.城市分公司]",
                                    "filter": {
                                        "members": [""+$(objx).text()+""]
                                    }
                                }
                            })
                            pingAnDataServices.getData(pcIndexFactory[factiaojian], pcIndexFactory.address).then(function(data) {
                                // $scope.func(data.headers, data.values, ".tBodyerHoliday:first", 1);
                                function valx(){
                                    let arr=[];
                                    for(let x=0;x<data.values.length;x++){
                                        arr.push(data.values[x].slice(0,data.values[0].length-1))
                                    }
                                    return arr
                                }
                                let lasttable=$(".tBodyerHoliday:first tr").clone(true);
                                $(".table_back").css("display","none")
                                $scope.func(data.headers.slice(0,data.headers.length-1), valx(), ".tBodyerHoliday:first", 1,null,1);
                                $(".table_back").css("display","inline").click(function(){
                                    $(".tBodyerHoliday:first").empty().append(lasttable);
                                    $(".table_back").css("display","none")
                                })
                            });
                        })
                    }
                })
            })
        })
    }



    var arr=angular.copy(pcIndexFactory.already_nvested);
    pingAnDataServices.getData(arr,pcIndexFactory.address).then(function(data1) {
        // console.log(data1);
        // console.log(data1.values[0][0].data);
        $("#yitouzi").html(data1.values[0][0].data.toFixed(2));
    });
    var arr2=angular.copy(pcIndexFactory.development_area);
    pingAnDataServices.getData(arr2,pcIndexFactory.address).then(function(data1) {
        // console.log(data1);
        $("#yikaifa").html(data1.values[0].data.toFixed(2));
    });
    var arr3=angular.copy(pcIndexFactory.sales_amount);
    pingAnDataServices.getData(arr3,pcIndexFactory.address).then(function(data1) {
        // console.log(data1);
        $("#yixiaoshoujine").html(data1.values[0].data.toFixed(2));
    });
    var arr4=angular.copy(pcIndexFactory.profit);
    pingAnDataServices.getData(arr4,pcIndexFactory.address).then(function(data1) {
        // console.log(data1);
        $("#lirun").html(data1.values[0].data.toFixed(2));
    });
    var arr5=angular.copy(pcIndexFactory.sales_area);
    pingAnDataServices.getData(arr5,pcIndexFactory.address).then(function(data1) {
        // console.log(data1);
        $("#xiaoshoumianji").html(data1.values[0].data.toFixed(2));
    });
    //投资金额排名
    var arr6=angular.copy(pcIndexFactory.investment_ranking);
    pingAnDataServices.getData(arr6,pcIndexFactory.address).then(function(data1) {
        $scope.$broadcast('to-child', data1);
    });
    //分公司投资金额
    var arr7=angular.copy(pcIndexFactory.touzijine);
    pingAnDataServices.getData(arr7,pcIndexFactory.address).then(function(data) {
        // $scope.$broadcast('to-child', data1);
        $scope.func(data.headers,data.values,".tBodyerHoliday:first",1,"yitouzijinejutixiangmu")
        // $scope.touzijine=data1.values;
        // $scope.fengongsimingzi=data1.headers[0];
        // for(var i=1;i<$scope.touzijine[0].length;i++){
        //     var liehe=0;
        //     for(var j=0;j<$scope.touzijine.length;j++){
        //         liehe+=$scope.touzijine[j][i].data;
        //     }
        //     $("#yitouzijinebiaoge tbody tr:last").children().eq(i).html(liehe.toFixed(2))
        // }
    });
//已投资金额

    $("#yitouzijine").click(function(){
        var arr7=angular.copy(pcIndexFactory.touzijine);
        pingAnDataServices.getData(arr7,pcIndexFactory.address).then(function(data) {
            console.log(data)
            $scope.func(data.headers,data.values,".tBodyerHoliday:first",1,"yitouzijinejutixiangmu")
        });
        $scope.bool2=true;
        var arr6=angular.copy(pcIndexFactory.investment_ranking);
        pingAnDataServices.getData(arr6,pcIndexFactory.address).then(function(data1) {
            $scope.$broadcast('to-child', data1);
            // console.log(data1);
        });
        //分公司投资金额
        // var arr7=angular.copy(pcIndexFactory.touzijine);
        // pingAnDataServices.getData(arr7,pcIndexFactory.address).then(function(data1) {
        //     $scope.touzijine=data1.values;
        //     console.log(data1);
        //     $scope.fengongsimingzi=data1.headers[0];
        //     for(var i=1;i<$scope.touzijine[0].length;i++){
        //         var liehe=0;
        //         for(var j=0;j<$scope.touzijine.length;j++){
        //             liehe+=$scope.touzijine[j][i].data;
        //         }
        //         $("#yitouzijinebiaoge tbody tr:last").children().eq(i).html(liehe.toFixed(2))
        //     }
        // });

        $(".table_back").css("display","none")
        $("#chakanxiang1").html("投资金额排名(亿元)");
        $("#chakanxiang2").html("投资金额(亿元)");
    });
//已投资金额具体项目

    // $scope.yitouzijinejuti=function(fengongsi) {
    //     if(!$scope.bool2){return false;}
    //     $scope.bool2=false;
    //     var arr11=angular.copy(pcIndexFactory.yitouzijinejutixiangmu);
    //     arr11.metadata.push(
    //         {
    //             "jaql": {
    //                 "dim": "[城市分公司-城市指标监控.城市分公司]",
    //                 "filter": {
    //                     "members": [""+fengongsi+""]
    //                 }
    //
    //             }
    //         }
    //
    //     );
    //     pingAnDataServices.getData(arr11,pcIndexFactory.address).then(function(data1) {
    //         $scope.touzijine=data1.values;
    //         $scope.fengongsimingzi=data1.headers[0];
    //         for(var i=1;i<$scope.touzijine[0].length-1;i++){
    //             var liehe=0;
    //             for(var j=0;j<$scope.touzijine.length;j++){
    //                 liehe+=$scope.touzijine[j][i].data;
    //             }
    //             $("#yitouzijinebiaoge tbody tr:last").children().eq(i).html(parseFloat(liehe).toFixed(2));
    //             // $("#yitouzijinebiaoge tbody tr td a").attr('href','javascript:;');
    //         }
    //     });
    // }
//已开发面积
    $("#yikaifamianji").click(function(){
        $scope.bool2=true;
        $(".table_back").css("display","none")
        $("#chakanxiang1").html("开发面积排名(万方)");
        $("#chakanxiang2").html("开发面积(万方)");
        var arr8=angular.copy(pcIndexFactory.yikaifamianji);
        pingAnDataServices.getData(arr8,pcIndexFactory.address).then(function(data1) {
            $scope.$broadcast('to-child', data1);
        });
        //已开发面积表格
        var arr9=angular.copy(pcIndexFactory.yikaifamianjibiaoge);
        pingAnDataServices.getData(arr9,pcIndexFactory.address).then(function(data) {
            $scope.func(data.headers,data.values,".tBodyerHoliday:first",1,"yikaifamianjijutixiangmu");
        });
    });
//已开发面积具体项目

//已销售金额图
    $("#yixiaoshouje").click(function(){
        $scope.bool2=true;
        $(".table_back").css("display","none")
        $("#chakanxiang1").html("销售金额排名(亿元)");
        $("#chakanxiang2").html("销售金额(亿元)");
        var arr10=angular.copy(pcIndexFactory.yixiaoshoujinetu);
        pingAnDataServices.getData(arr10,pcIndexFactory.address).then(function(data1) {
            console.log(data1);
            $scope.$broadcast('to-child', data1);
        });
        //已销售金额表格
        var arr11=angular.copy(pcIndexFactory.yixiaoshoujinebiaoge);
        pingAnDataServices.getData(arr11,pcIndexFactory.address).then(function(data) {
            $scope.func(data.headers,data.values,".tBodyerHoliday:first",1,"yixiaoshoujinejutixiangmu");

        });

    });
    //已销售金额具体项目


    //利润额图
    $("#lirune").click(function(){
        $scope.bool2=true;
        $(".table_back").css("display","none")
        $("#chakanxiang1").html("利润额排名(亿元)");
        $("#chakanxiang2").html("利润额(亿元)");
        var arr12=angular.copy(pcIndexFactory.lirune);
        pingAnDataServices.getData(arr12,pcIndexFactory.address).then(function(data1) {
            console.log(data1);
            $scope.$broadcast('to-child', data1);
            console.log(data1);

        });
        // 利润额表格
        var arr13=angular.copy(pcIndexFactory.lirunebiaoge);
        pingAnDataServices.getData(arr13,pcIndexFactory.address).then(function(data) {
            $scope.func(data.headers,data.values,".tBodyerHoliday:first",1,"lirunejutixiangmu");

        });
    });
    //利润额具体项目

    //已销售面积
    $("#yixiaoshoumianji").click(function(){
        $scope.bool2=true;
        $(".table_back").css("display","none")
        $("#chakanxiang1").html("销售面积排名(万方)");
        $("#chakanxiang2").html("销售面积(万方)");
        var arr14=angular.copy(pcIndexFactory.yixiaoshoumianji);
        pingAnDataServices.getData(arr14,pcIndexFactory.address).then(function(data1) {
            $scope.$broadcast('to-child', data1);
        });
        // 已销售面积表格
        var arr15=angular.copy(pcIndexFactory.yixiaoshoumianjibiaoge);
        pingAnDataServices.getData(arr15,pcIndexFactory.address).then(function(data) {
            $scope.func(data.headers,data.values,".tBodyerHoliday:first",1,"yixiaoshoumianjijutixiangmu");

        });
    });
    //已销售面积具体项目



    // KPI和权益的切换事件
    $scope.contentChanges=false;
    $scope.contentChanges1=true;
    // $scope.normChanges=false;
    // $scope.normChanges1=true;
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

    $scope.thirdLi=function () {
        // $scope.normChanges=false;
        // $scope.normChanges1=true;
        $(".thirdLi").addClass("liActive").siblings().removeClass("liActive");
    };
    $scope.fouthLi=function () {
        // $scope.normChanges=true;
        // $scope.normChanges1=false;
        $(".fouthLi").addClass("liActive").siblings().removeClass("liActive");
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
            itemWidth: 12,
            itemHeight: 12,
            data:[
                {
                    name:'实际',
                    icon: 'bar',
                },{
                    name:'计划',
                    icon: 'bar',                    // textStyle:{color:'red'}
                }
            ],
        },
        grid: {
            left: '',
            right: '50',
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
            data: [
                '总部','深莞惠','安德','华中区','华南区','上海区','北方区','东南区','华西区','华东区'
            ],
            splitNumber:1,
            splitLine:{
                show:true
            }
        },
        series: [
            {
                name: '实际',
                type: 'bar',
                data: [
                    12, 7.25, 29.47, 101.22, 104.33, 130.27, 144.15, 193.81, 199.09, 201.93
                ],
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
                    symbolSize:0,
                    // itemStyle:{
                    //     normal:{
                    //         color:'#27B7E9',
                    //         label:{
                    //             show: true,
                    //             position: 'top',
                    //             formatter: function (param) {
                    //                 if (param.value == 1)
                    //                     return '';
                    //                 else
                    //                     return '';
                    //             }
                    //         }
                    //     }
                    // }
                },
                label: {
                    normal: {
                        position: 'right',
                        show: true
                    }
                },
                //设置柱子的宽度
                barWidth : '30%',
                itemStyle: {
                    //通常情况下：
                    normal:{
                        //每个柱子的颜色即为colorList数组里的每一项，如果柱子数目多于colorList的长度，则柱子颜色循环使用该数组
                        /*color: function (params){
                            var colorList = ['#27B7E9'];
                            return colorList[params.dataIndex];
                        }*/
                        color:'#27B7E9',
                        shadowBlur: 5,
                        shadowOffsetY: 5,
                        shadowColor: '#7D7DFF',
                    },
                    //鼠标悬停时：
                    emphasis: {
                        shadowBlur: 10,
                        shadowOffsetX: 0,
                        shadowColor: '#fff',
                        color:'#27B7E9'
                    }
                },
            }
            // ,
            // {
            //     name: '计划',
            //     type: 'bar',
            //     data: [8, 5.58, 27.62, 71.42, 114.23, 108.31, 114.24, 150.82, 160.21, 165.52],
            //     markPoint : {
            //         data : [
            //             {name : '1', value : 0, xAxis: 8, yAxis: '总部'},
            //             {name : '2', value : 0, xAxis: 5.58, yAxis: '深莞惠'},
            //             {name : '3', value : 0, xAxis: 27.62, yAxis: '安德'},
            //             {name : '4', value : 0, xAxis: 71.42, yAxis: '华中区'},
            //             {name : '5', value : 0, xAxis: 114.23, yAxis: '华南区'},
            //             {name : '6', value : 0, xAxis: 108.31, yAxis: '上海区'},
            //             {name : '7', value : 0, xAxis: 114.24, yAxis: '北方区'},
            //             {name : '8', value : 0, xAxis: 150.82, yAxis: '东南区'},
            //             {name : '9', value : 0, xAxis: 160.21, yAxis: '华西区'},
            //             {name : '10', value : 0, xAxis:165.52, yAxis: '华东区'}
            //         ],
            //         symbolSize:10,
            //         itemStyle:{
            //             normal:{
            //                 color:'#B86167',
            //                 label:{
            //                 show: true,
            //                 position: 'top',
            //                 formatter: function (param) {
            //                     if (param.value == 1)
            //                         return '';
            //                     else
            //                         return '';
            //                 }
            //                 }
            //             }
            //         }
            //     },
            //     //设置柱子的宽度
            //     barWidth : 8,
            //     label: {
            //         normal: {
            //             position: 'right',
            //             show: true
            //         }
            //     },
            //     itemStyle: {
            //         //通常情况下：
            //         normal:{
            //             //每个柱子的颜色即为colorList数组里的每一项，如果柱子数目多于colorList的长度，则柱子颜色循环使用该数组
            //             color: function (params){
            //                 var colorList = ['#B86167'];
            //                 return colorList[params.dataIndex];
            //             }
            //         },
            //         //鼠标悬停时：
            //         emphasis: {
            //             shadowBlur: 10,
            //             shadowOffsetX: 0,
            //             shadowColor: 'red'
            //         }
            //     },
            // }
        ]
    };
    $scope.$on('to-child', function(event,data) {
        var by = function(name){
            return function(o, p){
                var a, b;
                if (typeof o === "object" && typeof p === "object" && o && p) {
                    a = o[name];
                    b = p[name];
                    if (a === b) {
                        return 0;
                    }
                    if (typeof a === typeof b) {
                        return a < b ? -1 : 1;
                    }
                    return typeof a < typeof b ? -1 : 1;
                }
                else {
                    throw ("error");
                }
            }
        }
        var hengtiaodata=[parseFloat(data.values[0][1].data).toFixed(2),parseFloat(data.values[1][1].data).toFixed(2)]

        var markPointdata=[
            {name: "2", value: 1, xAxis: data.values[0][1].data, yAxis: data.values[0][0].data},
            {name: "2", value: 1, xAxis: data.values[1][1].data, yAxis: data.values[1][0].data},
        ]
        //   console.log(data.values);         //子级能得到值
        // console.log(option.series)  ;
        //   option.series[0].markPoint.data[0].xAxis=parseFloat(data.values[0][1].data);//总部
        //    option.series[0].data[0]=parseFloat((data.values[0][1].data).toFixed(2));//总部
        //   option.series[0].markPoint.data[5].xAxis=parseFloat(data.values[1][1].data);//上海
        //   option.series[0].data[5]=parseFloat((data.values[1][1].data).toFixed(2));//上海
        //   option.series[0].data.sort();
        var hengtiao=hengtiaodata.sort(function (x,y) {
            return x-y;
        })//横条数据排序


        var markpoint= markPointdata.sort(by("xAxis"));//小点排序
        var yAxis=[markpoint[0].yAxis,markpoint[1].yAxis]//将小点排序里的y轴名称提取称一个数组
        if(hengtiao[0]<0){
            hengtiao=hengtiao.reverse();
            yAxis=yAxis.reverse();
        }
        option.series[0].data=hengtiao;//横条数据排序完后赋值回echarts
        option.yAxis.data=yAxis;//将名称数组赋值给Y轴
        // option.yAxis.data=option.series[0].markPoint.data[0]
        option.series[0].markPoint.data=markpoint;//将排序好的小点赋值给echarts
		if((hengtiao[hengtiao.length-1])>0){
            option.xAxis.max=(hengtiao[hengtiao.length-1]*1.3).toFixed(0);

        }else {
		    // console.log(((Math.abs(hengtiao[0]))*1.1).toFixed(0))
		    option.xAxis.max=((Math.abs(hengtiao[0]))*1.3).toFixed(0);
        }
        if(hengtiao[0]<-0.01){
            // console.log(hengtiao[0]);
            option.xAxis.min=(hengtiao[hengtiao.length-1]*1.3).toFixed(0);

        }
        mapChart.setOption(option);
    });



}])


app.controller('echartColumnControllerH1',["$scope",function($scope){

    var mapChart = echarts.init(document.getElementById('container'));
    var option1 = {
        // color: ['#3398DB'],
        tooltip : {
            trigger: 'axis',
            axisPointer : {            // 坐标轴指示器，坐标轴触发有效
                type : 'shadow'        // 默认为直线，可选为：'line' | 'shadow'
            }
        },
        grid: {
            left: '-30',
            right: '',
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
        // itemStyle: {
        //     //通常情况下：
        //     normal:{
        //         color:'#23B6E9',
        //     }
        // },
        series : [
            {
                type:'bar',
                barWidth: '20',
                data:[{
                    value:30,
                    itemStyle:{
                        normal:{
                            color:'#FF4700'
                        }
                    }
                },{
                    value:60,
                    itemStyle:{
                        normal:{
                            color:'#49CEED'
                        }
                    }
                }]
            },
        ]
    };
    mapChart.setOption(option1)
}])

app.controller('echartColumnControllerH2',["$scope",function($scope){

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
                type:'bar',
                barWidth: '20',
                data:[{
                    value:30,
                    itemStyle:{
                        normal:{
                            color:'#FF4700'
                        }
                    }
                },{
                    value:60,
                    itemStyle:{
                        normal:{
                            color:'#49CEED'
                        }
                    }
                }]
            },
        ]
    };
    mapChart.setOption(option1)
}])

app.controller('echartColumnControllerH3',["$scope",function($scope){

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
                type:'bar',
                barWidth: '20',
                data:[{
                    value:30,
                    itemStyle:{
                        normal:{
                            color:'#FF4700'
                        }
                    }
                },{
                    value:60,
                    itemStyle:{
                        normal:{
                            color:'#49CEED'
                        }
                    }
                }]
            },
        ]
    };
    mapChart.setOption(option1)
}])

app.controller('echartColumnControllerH4',["$scope",function($scope){

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
                type:'bar',
                barWidth: '20',
                data:[{
                    value:30,
                    itemStyle:{
                        normal:{
                            color:'#FF4700'
                        }
                    }
                },{
                    value:60,
                    itemStyle:{
                        normal:{
                            color:'#49CEED'
                        }
                    }
                }]
            },
        ]
    };
    mapChart.setOption(option1)
}])
