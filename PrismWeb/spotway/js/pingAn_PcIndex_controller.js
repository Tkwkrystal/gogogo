/**
 * Created by Administrator on 2017/11/16.
 */
'use strict';
var app=angular.module('pingAn_PcIndex', ['pingAnServices','ngDialog','app.services']);
angular.module('pingAn_PcIndex')
    .factory('Data', function(){
        return {
            name: 'htf'
        };
    })
app.controller('pingAnIndexController',['$scope',"$http","pingAnDataServices","pcIndexFactory",'funAuthHelper',function ($scope,$http,pingAnDataServices,pcIndexFactory,$funAuthHelper) {

    $("#main").height(405)
    $scope.chengeCont1=function () {
        $scope.zhongguo=false;
        $(".bodyerSpan").text("累计已投资额(亿元)");
        $(".contentTop").removeClass("contentTopActive contentTopActive1 contentTopActive2 contentTopActive3");
        $("#haiwaitiao").addClass("contentTopActive");
        $("#main2").css('visibility','visible');
        $("#main").css('visibility','hidden');
        $("#cause2").css('display','block');
        $("#cause1").css('display','none');
        // $this.style.backgroundColor='#d8e1e3'
        document.getElementById("b2").style.backgroundColor='#fff';
        document.getElementById("b1").style.backgroundColor='#d8e1e3';
        pingAnDataServices.getData(pcIndexFactory.leijitouziditu,pcIndexFactory.address).then(function(data){
            // console.log(data.values);
            $scope.$broadcast('to-leijitouzi', data.values);
        })
        // 海外地图获取数据
        pingAnDataServices.getData(pcIndexFactory.haiwai,pcIndexFactory.address).then(function(data){
            console.log(data);
            $scope.$broadcast('to-haiwaishuju', data);
        })
        pingAnDataServices.getData(pcIndexFactory.shiyebu,pcIndexFactory.address).then(function(data1){
            // console.log(data1);
            $(".spanPercent1").text((data1.values[5][2].data/10000).toFixed(2));//开发投资事业部
            var shangyeshiyebu=(data1.values[1][2].data/10000)+(data1.values[2][2].data/10000);
            $(".spanPercent2").text(shangyeshiyebu.toFixed(2));//商业事业部
            $(".spanPercent3").text((data1.values[0][2].data/10000).toFixed(2));//养生度假事业部
            $(".spanPercent4").text((data1.values[3][2].data/10000).toFixed(2));//城市发展事业部
            $(".spanPercent5").text((data1.values[4][2].data/10000).toFixed(2));//工业物流事业部
            var celuejihaiwai=(data1.values[6][2].data/10000)+(data1.values[7][2].data/10000)+(data1.values[8][2].data/10000);
            $(".spanPercent6").text(celuejihaiwai.toFixed(2));//策略及海外事业部
            var jinrongchanpin=(data1.values[9][2].data/10000)+(data1.values[10][2].data/10000);
            $(".spanPercent7").text(jinrongchanpin.toFixed(2));//金融产品事业部
            $(".spanPercent14").text((data1.values[9][2].data/10000).toFixed(2));//保险金融
            $(".spanPercent15").text((data1.values[10][2].data/10000).toFixed(2));//开发金融
            $(".spanPercent8").text(celuejihaiwai.toFixed(2));//策略及海外事业部
            $(".spanPercent9").text((data1.values[1][2].data/10000).toFixed(2));//商业开发建设
            $(".spanPercent10").text((data1.values[2][2].data/10000).toFixed(2));//商业资产管理
            $(".spanPercent11").text((data1.values[6][2].data/10000).toFixed(2));//公司层面可转债
            $(".spanPercent12").text((data1.values[7][2].data/10000).toFixed(2));//公司层面股权
            $(".spanPercent13").text((data1.values[8][2].data/10000).toFixed(2));//海外合作开发

            //
            // var s1 = parseFloat((data1.values[5][2].data/10000).toFixed(2));
            // var s2 = parseFloat(shangyeshiyebu.toFixed(2));
            // var s3 = parseFloat((data1.values[0][2].data/10000).toFixed(2));
            // var s4 = parseFloat((data1.values[3][2].data/10000).toFixed(2));
            // var s5 = parseFloat((data1.values[4][2].data/10000).toFixed(2));
            // var s6 = parseFloat(celuejihaiwai.toFixed(2));
            // var s7 = parseFloat(jinrongchanpin.toFixed(2));
            // var sum = s1 + s2 + s3 + s4 + s5 + s6 + s7;
            // var a1 = s1 / sum * 100+"%";
            // var a2 = s2 / sum * 100+"%";
            // var a3 = s3 / sum * 100+"%";
            // var a4 = s4 / sum * 100+"%";
            // var a5 = s5 / sum * 100+"%";
            // var a6 = s6 / sum * 100+"%";
            // var a7 = s7 / sum * 100+"%";
            // $(" .footer .footerRight ul.causeUl1 li .bottomBox .topBox").width(a1);
            // $(" .footer .footerRight ul.causeUl1 li .bottomBox .topBox1").width(a2);
            // $(" .footer .footerRight ul.causeUl1 li .bottomBox .topBox2").width(a3);
            // $(" .footer .footerRight ul.causeUl1 li .bottomBox .topBox3").width(a4);
            // $(" .footer .footerRight ul.causeUl1 li .bottomBox .topBox4").width(a5);
            // $(".footer .footerRight ul.causeUl1 li .bottomBox .topBox5").width(a6);
            // $(" .footer .footerRight ul.causeUl1 li .bottomBox .topBox6").width(a7);


        })


    }
    //点击跳转左边nav背景色变化
    $(".details").each(function(inedx,obj){
        $(obj).click(function(){
            $(".titleName").each(function(indexx,objj){
                //判断点击的前两个字在左侧是否能找到
                if($(objj).text().indexOf($(obj).parent().children().eq(0).text().substring(0,2))>=0){
                    $(objj).parent().css("background","#0a9ccc").parent().siblings().children().css("background","#1D2B36");
                }
            })
        })
    })
    //不同详情点击跳转
    $("#kaifatouzi").click(function(){window.location.href="#/app/pcNorm"});
    $("#shangyeshiyebu").click(function(){window.location.href="#/app/pcBusiness"});
    $("#yangshengdujia").click(function(){window.location.href="#/app/pcHoliday"});
    $("#jinrongchanpin").click(function(){window.location.href="#/app/pcFinance"});
    $("#gongyewuliu").click(function(){window.location.href="#/app/pcIndustry"});
    $(".jianhao").each(function(index,obj){
        $(obj).click(function(){

                if($(obj).children().eq(1).attr("class")=="glyphicon glyphicon-plus"){
                    $(obj).children().eq(1).attr("class","glyphicon glyphicon-minus");
                }else{
                    $(obj).children().eq(1).attr("class","glyphicon glyphicon-plus")
                }

        })

    })
    // 策略及海外事业部详情不能点击
    $(".jianhao1").each(function(index,obj){
        $(obj).click(function(){

            if($("#xiangqin1").attr("class")=="glyphicon glyphicon-plus"){
                $("#xiangqin1").attr("class","glyphicon glyphicon-minus");
            }else{
                $("#xiangqin1").attr("class","glyphicon glyphicon-plus")
            }
            if($("#xiangqin2").attr("class")=="glyphicon glyphicon-plus"){
                $("#xiangqin2").attr("class","glyphicon glyphicon-minus");
            }else{
                $("#xiangqin2").attr("class","glyphicon glyphicon-plus")
            }

        })

    })
    $("#xiangqin1").click(function(){

            if($("#xiangqin1").attr("class")=="glyphicon glyphicon-plus"){
                $("#xiangqin1").attr("class","glyphicon glyphicon-minus");
            }else{
                $("#xiangqin1").attr("class","glyphicon glyphicon-plus")
            }
            // if($("#xiangqin2").attr("class")=="glyphicon glyphicon-plus"){
            //     $("#xiangqin2").attr("class","glyphicon glyphicon-minus");
            // }else{
            //     $("#xiangqin2").attr("class","glyphicon glyphicon-plus")
            // }

        })
    $("#xiangqin2").click(function(){

        if($("#xiangqin2").attr("class")=="glyphicon glyphicon-plus"){
            $("#xiangqin2").attr("class","glyphicon glyphicon-minus");
        }else{
            $("#xiangqin2").attr("class","glyphicon glyphicon-plus")
        }
        // if($("#xiangqin2").attr("class")=="glyphicon glyphicon-plus"){
        //     $("#xiangqin2").attr("class","glyphicon glyphicon-minus");
        // }else{
        //     $("#xiangqin2").attr("class","glyphicon glyphicon-plus")
        // }

    })



    $scope.showshiyebu=false;
    $scope.showshiyebu1=false;
    $scope.showshiyebu2=false;
    $scope.showshiyebu3=false;
    $scope.causeShow=false;
    // console.log(pcIndexFactory);


    pingAnDataServices.getData(pcIndexFactory.leijitouziditu,pcIndexFactory.address).then(function(data){
        // console.log(data.values);
        $scope.$broadcast('to-leijitouzi', data.values);
    })
    $(".contentTop").each(function (index,ele) {
        $(ele).click(function () {
            // alert(index);
            if(index==0){
                    $(".bodyerSpan").text($(".pFont").eq(index).text());
                $(".contentTop").removeClass("contentTopActive contentTopActive1 contentTopActive2 contentTopActive3");
                $(this).addClass("contentTopActive");
                pingAnDataServices.getData(pcIndexFactory.leijitouziditu,pcIndexFactory.address).then(function(data){
                    // console.log(data.values);
                    $scope.$broadcast('to-leijitouzi', data.values);
                })
                // 海外地图获取数据
                pingAnDataServices.getData(pcIndexFactory.haiwai,pcIndexFactory.address).then(function(data){
                    console.log(data);
                    $scope.$broadcast('to-haiwaishuju', data);
                })
            }
            if(index==1){
                $(".bodyerSpan").text($(".pFont").eq(index).text());
                $(".contentTop").removeClass("contentTopActive contentTopActive1 contentTopActive2 contentTopActive3");
                $(this).addClass("contentTopActive1");
                pingAnDataServices.getData(pcIndexFactory.dangniantouziditu,pcIndexFactory.address).then(function(data){
                    // console.log(data.values);
                    $scope.$broadcast('to-dangniantouzi', data.values);
                })
                // 海外地图获取数据
                pingAnDataServices.getData(pcIndexFactory.haiwaidangnian,pcIndexFactory.address).then(function(data){
                    // console.log(data);
                    $scope.$broadcast('to-haiwaishuju', data);
                })
            }
            if(index==2){
                if($("#b1").css("background-color")=='rgb(255, 255, 255)'){
                    $(".bodyerSpan").text($(".pFont").eq(index).text());
                }
                $(".contentTop").removeClass("contentTopActive contentTopActive1 contentTopActive2 contentTopActive3");
                $(this).addClass("contentTopActive2");
                pingAnDataServices.getData(pcIndexFactory.yitouxiangmushuditu,pcIndexFactory.address).then(function(data){
                    // console.log(data.values);
                    $scope.$broadcast('to-yitouxiangmushu', data.values);
                })
            }
            if(index==3){
                if($("#b1").css("background-color")=='rgb(255, 255, 255)'){
                    $(".bodyerSpan").text($(".pFont").eq(index).text());
                }
                $(".contentTop").removeClass("contentTopActive contentTopActive1 contentTopActive2 contentTopActive3");
                $(this).addClass("contentTopActive3");
                pingAnDataServices.getData(pcIndexFactory.leijiyitoumianjiditu,pcIndexFactory.address).then(function(data){
                    // console.log(data.values);
                    $scope.$broadcast('to-leijiyitoumianji', data.values);
                })

            }
            // $(".contentChanges").removeClass("contentTopActive");
            // $(this).addClass("contentTopActive");
            // if($("#b1").css("background-color")=='rgb(255, 255, 255)'){
            //     $(".bodyerSpan").text($(".pFont").eq(index).text());
            // }

            switch (index){
                case 0 :
                    var arr=angular.copy(pcIndexFactory.Accumulated_investment);
                    var copyarr=angular.copy(pcIndexFactory.Accumulated_investment);
                    arr.metadata.push(
                        {
                            "jaql": {
                                "dim": "[首页.事业部]",
                                //"agg":"sum"
                            }
                        }
                    );


                    pingAnDataServices.getData(pcIndexFactory.shiyebu,pcIndexFactory.address).then(function(data1){
                        console.log(data1);
                            $(".spanPercent1").text((data1.values[5][2].data/10000).toFixed(2));//开发投资事业部
                        var shangyeshiyebu=(data1.values[1][2].data/10000)+(data1.values[2][2].data/10000);
                            $(".spanPercent2").text(shangyeshiyebu.toFixed(2));//商业事业部
                            $(".spanPercent3").text((data1.values[0][2].data/10000).toFixed(2));//养生度假事业部
                            $(".spanPercent4").text((data1.values[3][2].data/10000).toFixed(2));//城市发展事业部
                            $(".spanPercent5").text((data1.values[4][2].data/10000).toFixed(2));//工业物流事业部
                        var celuejihaiwai=(data1.values[6][2].data/10000)+(data1.values[7][2].data/10000)+(data1.values[8][2].data/10000);
                            $(".spanPercent6").text(celuejihaiwai.toFixed(2));//策略及海外事业部
                        var jinrongchanpin=(data1.values[9][2].data/10000)+(data1.values[10][2].data/10000);
                            $(".spanPercent7").text(jinrongchanpin.toFixed(2));//金融产品事业部
                            $(".spanPercent14").text((data1.values[9][2].data/10000).toFixed(2));//保险金融
                        $(".spanPercent15").text((data1.values[10][2].data/10000).toFixed(2));//开发金融
                            $(".spanPercent8").text(celuejihaiwai.toFixed(2));//策略及海外事业部
                        $(".spanPercent9").text((data1.values[1][2].data/10000).toFixed(2));//商业开发建设
                        $(".spanPercent10").text((data1.values[2][2].data/10000).toFixed(2));//商业资产管理
                        $(".spanPercent11").text((data1.values[6][2].data/10000).toFixed(2));//公司层面可转债
                        $(".spanPercent12").text((data1.values[7][2].data/10000).toFixed(2));//公司层面股权
                        $(".spanPercent13").text((data1.values[8][2].data/10000).toFixed(2));//海外合作开发


                        var s1 = parseFloat((data1.values[5][2].data/10000).toFixed(2));
                            var s2 = parseFloat(shangyeshiyebu.toFixed(2));
                            var s3 = parseFloat((data1.values[0][2].data/10000).toFixed(2));
                            var s4 = parseFloat((data1.values[3][2].data/10000).toFixed(2));
                            var s5 = parseFloat((data1.values[4][2].data/10000).toFixed(2));
                            var s6 = parseFloat(celuejihaiwai.toFixed(2));
                            var s7 = parseFloat(jinrongchanpin.toFixed(2));
                            var sum = s1 + s2 + s3 + s4 + s5 + s6 + s7;
                            var a1 = s1 / sum * 100+"%";
                            var a2 = s2 / sum * 100+"%";
                            var a3 = s3 / sum * 100+"%";
                            var a4 = s4 / sum * 100+"%";
                            var a5 = s5 / sum * 100+"%";
                            var a6 = s6 / sum * 100+"%";
                            var a7 = s7 / sum * 100+"%";
                            $(" .footer .footerRight ul.causeUl1 li .bottomBox .topBox").width(a1);
                            $(" .footer .footerRight ul.causeUl1 li .bottomBox .topBox1").width(a2);
                            $(" .footer .footerRight ul.causeUl1 li .bottomBox .topBox2").width(a3);
                            $(" .footer .footerRight ul.causeUl1 li .bottomBox .topBox3").width(a4);
                            $(" .footer .footerRight ul.causeUl1 li .bottomBox .topBox4").width(a5);
                            $(".footer .footerRight ul.causeUl1 li .bottomBox .topBox5").width(a6);
                            $(" .footer .footerRight ul.causeUl1 li .bottomBox .topBox6").width(a7);


                    })


                    // pingAnDataServices.getData(arr,pcIndexFactory.address).then(function(data1){
                    //     // console.log(data1.values);
                    //     $(".spanPercent1").text((data1.values[4][0].data/10000).toFixed(2));
                    //     $(".spanPercent2").text((data1.values[1][0].data/10000).toFixed(2));
                    //     $(".spanPercent3").text((data1.values[0][0].data/10000).toFixed(2));
                    //     $(".spanPercent4").text((data1.values[2][0].data/10000).toFixed(2));
                    //     $(".spanPercent5").text((data1.values[3][0].data/10000).toFixed(2));
                    //     $(".spanPercent6").text((data1.values[5][0].data/10000).toFixed(2));
                    //     $(".spanPercent7").text((data1.values[6][0].data/10000).toFixed(2));
                    //     $(".spanPercent8").text((data1.values[5][0].data/10000).toFixed(2));
                    //     var s1 = parseFloat((data1.values[4][0].data / 10000).toFixed(2));
                    //     var s2 = parseFloat((data1.values[1][0].data / 10000).toFixed(2));
                    //     var s3 = parseFloat((data1.values[0][0].data / 10000).toFixed(2));
                    //     var s4 = parseFloat((data1.values[2][0].data / 10000).toFixed(2));
                    //     var s5 = parseFloat((data1.values[3][0].data / 10000).toFixed(2));
                    //     var s6 = parseFloat((data1.values[5][0].data / 10000).toFixed(2));
                    //     var s7 = parseFloat((data1.values[6][0].data / 10000).toFixed(2));
                    //     var sum = s1 + s2 + s3 + s4 + s5 + s6 + s7;
                    //     var a1 = s1 / sum * 100+"%";
                    //     var a2 = s2 / sum * 100+"%";
                    //     var a3 = s3 / sum * 100+"%";
                    //     var a4 = s4 / sum * 100+"%";
                    //     var a5 = s5 / sum * 100+"%";
                    //     var a6 = s6 / sum * 100+"%";
                    //     var a7 = s7 / sum * 100+"%";
                    //     $(" .footer .footerRight ul.causeUl1 li .bottomBox .topBox").width(a1);
                    //     $(" .footer .footerRight ul.causeUl1 li .bottomBox .topBox1").width(a2);
                    //     $(" .footer .footerRight ul.causeUl1 li .bottomBox .topBox2").width(a3);
                    //     $(" .footer .footerRight ul.causeUl1 li .bottomBox .topBox3").width(a4);
                    //     $(" .footer .footerRight ul.causeUl1 li .bottomBox .topBox4").width(a5);
                    //     $(".footer .footerRight ul.causeUl1 li .bottomBox .topBox5").width(a6);
                    //     $(" .footer .footerRight ul.causeUl1 li .bottomBox .topBox6").width(a7);
                    //
                    //
                    //
                    //
                    //
                    //
                    //     // $(".f=ooter .footerRight ul.causeUl1 li .bottomBox .topBox").width='50%';
                    //
                    //
                    // });



                    copyarr.metadata.push(
                        {
                            "jaql": {
                                "dim": "[首页.城市分公司]",
                                //"agg":"sum"
                            }
                        }
                    );

                    pingAnDataServices.getData(copyarr,pcIndexFactory.address).then(function(data2){
                        // console.log(data2.values);

                        option.series[0].data[0].value[2]=(data2.values[8][0].data/10000).toFixed(2);//总部
                        option.series[0].data[1].value[2]=(data2.values[2][0].data/10000).toFixed(2);//北方区
                        option.series[0].data[2].value[2]=(data2.values[3][0].data/10000).toFixed(2);//华东区
                        option.series[0].data[3].value[2]=(data2.values[4][0].data/10000).toFixed(2);//华中区
                        option.series[0].data[4].value[2]=(data2.values[0][0].data/10000).toFixed(2);//上海区
                        option.series[0].data[5].value[2]=(data2.values[1][0].data/10000).toFixed(2);//东南区
                        option.series[0].data[6].value[2]=(data2.values[5][0].data/10000).toFixed(2);//华南区
                        option.series[0].data[7].value[2]=(data2.values[7][0].data/10000).toFixed(2);//安德区
                        option.series[0].data[8].value[2]=(data2.values[9][0].data/10000).toFixed(2);//深惠莞区
                        option.series[0].data[9].value[2]=(data2.values[6][0].data/10000).toFixed(2);//华西区
                        mapChart.setOption(option);
                    });


                    ;break;
                case 1 :
                    var arr1=angular.copy(pcIndexFactory.heavy_investment_year);
                    var copyarr1=angular.copy(pcIndexFactory.heavy_investment_year);

                    arr1.metadata.push(
                        {
                            "jaql": {
                                "dim": "[首页.事业部]",
                                //"agg":"sum"
                            }
                        }
                    );
                    pingAnDataServices.getData(pcIndexFactory.shiyebu,pcIndexFactory.address).then(function(data1){
                        console.log(data1);
                        $(".spanPercent1").text((data1.values[5][4].data/10000).toFixed(2));//开发投资事业部
                        var shangyeshiyebu=(data1.values[1][4].data/10000)+(data1.values[2][4].data/10000);
                        $(".spanPercent2").text(shangyeshiyebu.toFixed(2));//商业事业部
                        $(".spanPercent3").text((data1.values[0][4].data/10000).toFixed(2));//养生度假事业部
                        $(".spanPercent4").text((data1.values[3][4].data/10000).toFixed(2));//城市发展事业部
                        $(".spanPercent5").text((data1.values[4][4].data/10000).toFixed(2));//工业物流事业部
                        var celuejihaiwai=(data1.values[6][4].data/10000)+(data1.values[7][4].data/10000)+(data1.values[8][4].data/10000);
                        $(".spanPercent6").text(celuejihaiwai.toFixed(2));//策略及海外事业部
                        var jinrongchanpin=(data1.values[9][4].data/10000)+(data1.values[10][4].data/10000);
                        $(".spanPercent7").text(jinrongchanpin.toFixed(2));//金融产品事业部
                        $(".spanPercent14").text((data1.values[9][4].data/10000).toFixed(2));//保险金融
                        $(".spanPercent15").text((data1.values[10][4].data/10000).toFixed(2));//开发金融
                        $(".spanPercent8").text(celuejihaiwai.toFixed(2));//策略及海外事业部
                        $(".spanPercent9").text((data1.values[1][4].data/10000).toFixed(2));//商业开发建设
                        $(".spanPercent10").text((data1.values[2][4].data/10000).toFixed(2));//商业资产管理
                        $(".spanPercent11").text((data1.values[6][4].data/10000).toFixed(2));//公司层面可转债
                        $(".spanPercent12").text((data1.values[7][4].data/10000).toFixed(2));//公司层面股权
                        $(".spanPercent13").text((data1.values[8][4].data/10000).toFixed(2));//海外合作开发


                        var s1 = parseFloat((data1.values[5][4].data/10000).toFixed(2));
                        var s2 = parseFloat(shangyeshiyebu.toFixed(2));
                        var s3 = parseFloat((data1.values[0][4].data/10000).toFixed(2));
                        var s4 = parseFloat((data1.values[3][4].data/10000).toFixed(2));
                        var s5 = parseFloat((data1.values[4][4].data/10000).toFixed(2));
                        var s6 = parseFloat(celuejihaiwai.toFixed(2));
                        var s7 = parseFloat(jinrongchanpin.toFixed(2));
                        var sum = s1 + s2 + s3 + s4 + s5 + s6 + s7;
                        var a1 = s1 / sum * 100+"%";
                        var a2 = s2 / sum * 100+"%";
                        var a3 = s3 / sum * 100+"%";
                        var a4 = s4 / sum * 100+"%";
                        var a5 = s5 / sum * 100+"%";
                        var a6 = s6 / sum * 100+"%";
                        var a7 = s7 / sum * 100+"%";
                        $(" .footer .footerRight ul.causeUl1 li .bottomBox .topBox").width(a1);
                        $(" .footer .footerRight ul.causeUl1 li .bottomBox .topBox1").width(a2);
                        $(" .footer .footerRight ul.causeUl1 li .bottomBox .topBox2").width(a3);
                        $(" .footer .footerRight ul.causeUl1 li .bottomBox .topBox3").width(a4);
                        $(" .footer .footerRight ul.causeUl1 li .bottomBox .topBox4").width(a5);
                        $(".footer .footerRight ul.causeUl1 li .bottomBox .topBox5").width(a6);
                        $(" .footer .footerRight ul.causeUl1 li .bottomBox .topBox6").width(a7);


                    });
                    copyarr1.metadata.push(
                        {
                            "jaql": {
                                "dim": "[首页.城市分公司]",
                                //"agg":"sum"
                            }
                        }
                    );

                    pingAnDataServices.getData(copyarr1,pcIndexFactory.address).then(function(data2){
                        // console.log(data2);

                        option.series[0].data[0].value[2]=(data2.values[8][0].data/10000).toFixed(2);//总部
                        option.series[0].data[1].value[2]=(data2.values[2][0].data/10000).toFixed(2);//北方区
                        option.series[0].data[2].value[2]=(data2.values[3][0].data/10000).toFixed(2);//华东区
                        option.series[0].data[3].value[2]=(data2.values[4][0].data/10000).toFixed(2);//华中区
                        option.series[0].data[4].value[2]=(data2.values[0][0].data/10000).toFixed(2);//上海区
                        option.series[0].data[5].value[2]=(data2.values[1][0].data/10000).toFixed(2);//东南区
                        option.series[0].data[6].value[2]=(data2.values[5][0].data/10000).toFixed(2);//华南区
                        option.series[0].data[7].value[2]=(data2.values[7][0].data/10000).toFixed(2);//安德区
                        option.series[0].data[8].value[2]=(data2.values[9][0].data/10000).toFixed(2);//深惠莞区
                        option.series[0].data[9].value[2]=(data2.values[6][0].data/10000).toFixed(2);//华西区
                        mapChart.setOption(option);
                    })

                    ;break;
                case 2 :
                    var arr2=angular.copy(pcIndexFactory.number_of_items);
                    var copyarr2=angular.copy(pcIndexFactory.number_of_items);
                    arr2.metadata.push(
                        {
                            "jaql": {
                                "dim": "[首页.事业部]",
                                //"agg":"sum"
                            }
                        }
                    );
                    pingAnDataServices.getData(pcIndexFactory.shiyebu,pcIndexFactory.address).then(function(data1){
                        console.log(data1);
                        $(".spanPercent1").text((data1.values[5][3].data));//开发投资事业部
                        var shangyeshiyebu=(data1.values[1][3].data)+(data1.values[2][3].data);
                        $(".spanPercent2").text(shangyeshiyebu);//商业事业部
                        $(".spanPercent3").text((data1.values[0][3].data));//养生度假事业部
                        $(".spanPercent4").text((data1.values[3][3].data));//城市发展事业部
                        $(".spanPercent5").text((data1.values[4][3].data));//工业物流事业部
                        var celuejihaiwai=(data1.values[6][3].data)+(data1.values[7][3].data)+(data1.values[8][3].data);
                        $(".spanPercent6").text(celuejihaiwai);//策略及海外事业部
                        var jinrongchanpin=(data1.values[9][3].data)+(data1.values[10][3].data);
                        $(".spanPercent7").text(jinrongchanpin);//金融产品事业部
                        $(".spanPercent14").text((data1.values[9][3].data));//保险金融
                        $(".spanPercent15").text((data1.values[10][3].data));//开发金融
                        $(".spanPercent8").text(celuejihaiwai);//策略及海外事业部
                        $(".spanPercent9").text((data1.values[1][3].data));//商业开发建设
                        $(".spanPercent10").text((data1.values[2][3].data));//商业资产管理
                        $(".spanPercent11").text((data1.values[6][3].data));//公司层面可转债
                        $(".spanPercent12").text((data1.values[7][3].data));//公司层面股权
                        $(".spanPercent13").text((data1.values[8][3].data));//海外合作开发


                        var s1 = parseFloat((data1.values[5][3].data));
                        var s2 = parseFloat(shangyeshiyebu);
                        var s3 = parseFloat((data1.values[0][3].data));
                        var s4 = parseFloat((data1.values[3][3].data));
                        var s5 = parseFloat((data1.values[4][3].data));
                        var s6 = parseFloat(celuejihaiwai.toFixed(2));
                        var s7 = parseFloat(jinrongchanpin.toFixed(2));
                        var sum = s1 + s2 + s3 + s4 + s5 + s6 + s7;
                        var a1 = s1 / sum * 100+"%";
                        var a2 = s2 / sum * 100+"%";
                        var a3 = s3 / sum * 100+"%";
                        var a4 = s4 / sum * 100+"%";
                        var a5 = s5 / sum * 100+"%";
                        var a6 = s6 / sum * 100+"%";
                        var a7 = s7 / sum * 100+"%";
                        $(" .footer .footerRight ul.causeUl1 li .bottomBox .topBox").width(a1);
                        $(" .footer .footerRight ul.causeUl1 li .bottomBox .topBox1").width(a2);
                        $(" .footer .footerRight ul.causeUl1 li .bottomBox .topBox2").width(a3);
                        $(" .footer .footerRight ul.causeUl1 li .bottomBox .topBox3").width(a4);
                        $(" .footer .footerRight ul.causeUl1 li .bottomBox .topBox4").width(a5);
                        $(".footer .footerRight ul.causeUl1 li .bottomBox .topBox5").width(a6);
                        $(" .footer .footerRight ul.causeUl1 li .bottomBox .topBox6").width(a7);


                    });

                    copyarr2.metadata.push(
                        {
                            "jaql": {
                                "dim": "[首页.城市分公司]",
                                //"agg":"sum"
                            }
                        }
                    );

                    pingAnDataServices.getData(copyarr2,pcIndexFactory.address).then(function(data2){
                        // console.log(data2);

                        option.series[0].data[0].value[2]=(data2.values[8][0].data);//总部
                        option.series[0].data[1].value[2]=(data2.values[2][0].data);//北方区
                        option.series[0].data[2].value[2]=(data2.values[3][0].data);//华东区
                        option.series[0].data[3].value[2]=(data2.values[4][0].data);//华中区
                        option.series[0].data[4].value[2]=(data2.values[0][0].data);//上海区
                        option.series[0].data[5].value[2]=(data2.values[1][0].data);//东南区
                        option.series[0].data[6].value[2]=(data2.values[5][0].data);//华南区
                        option.series[0].data[7].value[2]=(data2.values[7][0].data);//安德区
                        option.series[0].data[8].value[2]="   "+(data2.values[9][0].data)+"   ";//深惠莞区
                        option.series[0].data[9].value[2]=(data2.values[6][0].data);//华西区
                        mapChart.setOption(option);
                    })

                    ;break;
                case 3 :
                    var arr3=angular.copy(pcIndexFactory.cumulative_dead_area);
                    var copyarr3=angular.copy(pcIndexFactory.cumulative_dead_area);

                    arr3.metadata.push(
                        {
                            "jaql": {
                                "dim": "[首页.事业部]",
                                //"agg":"sum"
                            }
                        }
                    );
                    pingAnDataServices.getData(pcIndexFactory.shiyebu,pcIndexFactory.address).then(function(data1){
                        console.log(data1);
                        $(".spanPercent1").text((data1.values[5][5].data/10000).toFixed(2));//开发投资事业部
                        var shangyeshiyebu=(data1.values[1][5].data/10000)+(data1.values[2][5].data/10000);
                        $(".spanPercent2").text(shangyeshiyebu.toFixed(2));//商业事业部
                        $(".spanPercent3").text((data1.values[0][5].data/10000).toFixed(2));//养生度假事业部
                        $(".spanPercent4").text((data1.values[3][5].data/10000).toFixed(2));//城市发展事业部
                        $(".spanPercent5").text((data1.values[4][5].data/10000).toFixed(2));//工业物流事业部
                        var celuejihaiwai=(data1.values[6][5].data/10000)+(data1.values[7][5].data/10000)+(data1.values[8][5].data/10000);
                        $(".spanPercent6").text(celuejihaiwai.toFixed(2));//策略及海外事业部
                        var jinrongchanpin=(data1.values[9][5].data/10000)+(data1.values[10][5].data/10000);
                        $(".spanPercent7").text(jinrongchanpin.toFixed(2));//金融产品事业部
                        $(".spanPercent14").text((data1.values[9][5].data/10000).toFixed(2));//保险金融
                        $(".spanPercent15").text((data1.values[10][5].data/10000).toFixed(2));//开发金融
                        $(".spanPercent8").text(celuejihaiwai.toFixed(2));//策略及海外事业部
                        $(".spanPercent9").text((data1.values[1][5].data/10000).toFixed(2));//商业开发建设
                        $(".spanPercent10").text((data1.values[2][5].data/10000).toFixed(2));//商业资产管理
                        $(".spanPercent11").text((data1.values[6][5].data/10000).toFixed(2));//公司层面可转债
                        $(".spanPercent12").text((data1.values[7][5].data/10000).toFixed(2));//公司层面股权
                        $(".spanPercent13").text((data1.values[8][5].data/10000).toFixed(2));//海外合作开发


                        var s1 = parseFloat((data1.values[5][5].data/10000).toFixed(2));
                        var s2 = parseFloat(shangyeshiyebu.toFixed(2));
                        var s3 = parseFloat((data1.values[0][5].data/10000).toFixed(2));
                        var s4 = parseFloat((data1.values[3][5].data/10000).toFixed(2));
                        var s5 = parseFloat((data1.values[4][5].data/10000).toFixed(2));
                        var s6 = parseFloat(celuejihaiwai.toFixed(2));
                        var s7 = parseFloat(jinrongchanpin.toFixed(2));
                        var sum = s1 + s2 + s3 + s4 + s5 + s6 + s7;
                        var a1 = s1 / sum * 100+"%";
                        var a2 = s2 / sum * 100+"%";
                        var a3 = s3 / sum * 100+"%";
                        var a4 = s4 / sum * 100+"%";
                        var a5 = s5 / sum * 100+"%";
                        var a6 = s6 / sum * 100+"%";
                        var a7 = s7 / sum * 100+"%";
                        $(" .footer .footerRight ul.causeUl1 li .bottomBox .topBox").width(a1);
                        $(" .footer .footerRight ul.causeUl1 li .bottomBox .topBox1").width(a2);
                        $(" .footer .footerRight ul.causeUl1 li .bottomBox .topBox2").width(a3);
                        $(" .footer .footerRight ul.causeUl1 li .bottomBox .topBox3").width(a4);
                        $(" .footer .footerRight ul.causeUl1 li .bottomBox .topBox4").width(a5);
                        $(".footer .footerRight ul.causeUl1 li .bottomBox .topBox5").width(a6);
                        $(" .footer .footerRight ul.causeUl1 li .bottomBox .topBox6").width(a7);


                    });

                    copyarr3.metadata.push(
                        {
                            "jaql": {
                                "dim": "[首页.城市分公司]",
                                //"agg":"sum"
                            }
                        }
                    );

                    pingAnDataServices.getData(copyarr3,pcIndexFactory.address).then(function(data2){
                        // console.log(data2);

                        option.series[0].data[0].value[2]=(data2.values[8][0].data/10000).toFixed(2);//总部
                        option.series[0].data[1].value[2]=(data2.values[2][0].data/10000).toFixed(2);//北方区
                        option.series[0].data[2].value[2]=(data2.values[3][0].data/10000).toFixed(2);//华东区
                        option.series[0].data[3].value[2]=(data2.values[4][0].data/10000).toFixed(2);//华中区
                        option.series[0].data[4].value[2]=(data2.values[0][0].data/10000).toFixed(2);//上海区
                        option.series[0].data[5].value[2]=(data2.values[1][0].data/10000).toFixed(2);//东南区
                        option.series[0].data[6].value[2]=(data2.values[5][0].data/10000).toFixed(2);//华南区
                        option.series[0].data[7].value[2]=(data2.values[7][0].data/10000).toFixed(2);//安德区
                        option.series[0].data[8].value[2]=(data2.values[9][0].data/10000).toFixed(2);//深惠莞区
                        option.series[0].data[9].value[2]=(data2.values[6][0].data/10000).toFixed(2);//华西区
                        mapChart.setOption(option);
                    })
                    ;break;
                default:break;
            }
        });
    });

    pingAnDataServices.getData(pcIndexFactory.Accumulated_investment,pcIndexFactory.address).then(function(data){
        // console.log(data);
        $(".pNumber1").text((data.values[0].data/10000).toFixed(2));
        $(".pNumber2").text((data.values[0].data/10000).toFixed(2));
    })

    var Arr=angular.copy(pcIndexFactory.Accumulated_investment);
    var Arr2=angular.copy(pcIndexFactory.Accumulated_investment);
    Arr.metadata.push(
        {
            "jaql": {
                "dim": "[首页.事业部]",
                //"agg":"sum"
            }
        }
    );
    pingAnDataServices.getData(pcIndexFactory.shiyebu,pcIndexFactory.address).then(function(data1){
        // console.log(data1);
        $(".spanPercent1").text((data1.values[5][2].data/10000).toFixed(2));//开发投资事业部
        var shangyeshiyebu=(data1.values[1][2].data/10000)+(data1.values[2][2].data/10000);
        $(".spanPercent2").text(shangyeshiyebu.toFixed(2));//商业事业部
        $(".spanPercent3").text((data1.values[0][2].data/10000).toFixed(2));//养生度假事业部
        $(".spanPercent4").text((data1.values[3][2].data/10000).toFixed(2));//城市发展事业部
        $(".spanPercent5").text((data1.values[4][2].data/10000).toFixed(2));//工业物流事业部
        var celuejihaiwai=(data1.values[6][2].data/10000)+(data1.values[7][2].data/10000)+(data1.values[8][2].data/10000);
        $(".spanPercent6").text(celuejihaiwai.toFixed(2));//策略及海外事业部
        var jinrongchanpin=(data1.values[9][2].data/10000)+(data1.values[10][2].data/10000);
        $(".spanPercent7").text(jinrongchanpin.toFixed(2));//金融产品事业部
        $(".spanPercent14").text((data1.values[9][2].data/10000).toFixed(2));//保险金融
        $(".spanPercent15").text((data1.values[10][2].data/10000).toFixed(2));//开发金融
        $(".spanPercent8").text(celuejihaiwai.toFixed(2));//策略及海外事业部
        $(".spanPercent9").text((data1.values[1][2].data/10000).toFixed(2));//商业开发建设
        $(".spanPercent10").text((data1.values[2][2].data/10000).toFixed(2));//商业资产管理
        $(".spanPercent11").text((data1.values[6][2].data/10000).toFixed(2));//公司层面可转债
        $(".spanPercent12").text((data1.values[7][2].data/10000).toFixed(2));//公司层面股权
        $(".spanPercent13").text((data1.values[8][2].data/10000).toFixed(2));//海外合作开发


        var s1 = parseFloat((data1.values[5][2].data/10000).toFixed(2));
        var s2 = parseFloat(shangyeshiyebu.toFixed(2));
        var s3 = parseFloat((data1.values[0][2].data/10000).toFixed(2));
        var s4 = parseFloat((data1.values[3][2].data/10000).toFixed(2));
        var s5 = parseFloat((data1.values[4][2].data/10000).toFixed(2));
        var s6 = parseFloat(celuejihaiwai.toFixed(2));
        var s7 = parseFloat(jinrongchanpin.toFixed(2));
        var sum = s1 + s2 + s3 + s4 + s5 + s6 + s7;
        var a1 = s1 / sum * 100+"%";
        var a2 = s2 / sum * 100+"%";
        var a3 = s3 / sum * 100+"%";
        var a4 = s4 / sum * 100+"%";
        var a5 = s5 / sum * 100+"%";
        var a6 = s6 / sum * 100+"%";
        var a7 = s7 / sum * 100+"%";
        $(" .footer .footerRight ul.causeUl1 li .bottomBox .topBox").width(a1);
        $(" .footer .footerRight ul.causeUl1 li .bottomBox .topBox1").width(a2);
        $(" .footer .footerRight ul.causeUl1 li .bottomBox .topBox2").width(a3);
        $(" .footer .footerRight ul.causeUl1 li .bottomBox .topBox3").width(a4);
        $(" .footer .footerRight ul.causeUl1 li .bottomBox .topBox4").width(a5);
        $(".footer .footerRight ul.causeUl1 li .bottomBox .topBox5").width(a6);
        $(" .footer .footerRight ul.causeUl1 li .bottomBox .topBox6").width(a7);


    })

    Arr2.metadata.push(
        {
            "jaql": {
                "dim": "[首页.城市分公司]",
                //"agg":"sum"
            }
        }
    );

    pingAnDataServices.getData(Arr2,pcIndexFactory.address).then(function(data2){
        // console.log(data2.values);

        option.series[0].data[0].value[2]=(data2.values[8][0].data/10000).toFixed(2);//总部
        option.series[0].data[1].value[2]=(data2.values[2][0].data/10000).toFixed(2);//北方区
        option.series[0].data[2].value[2]=(data2.values[3][0].data/10000).toFixed(2);//华东区
        option.series[0].data[3].value[2]=(data2.values[4][0].data/10000).toFixed(2);//华中区
        option.series[0].data[4].value[2]=(data2.values[0][0].data/10000).toFixed(2);//上海区
        option.series[0].data[5].value[2]=(data2.values[1][0].data/10000).toFixed(2);//东南区
        option.series[0].data[6].value[2]=(data2.values[5][0].data/10000).toFixed(2);//华南区
        option.series[0].data[7].value[2]=(data2.values[7][0].data/10000).toFixed(2);//安德区
        option.series[0].data[8].value[2]=(data2.values[9][0].data/10000).toFixed(2);//深惠莞区
        option.series[0].data[9].value[2]=(data2.values[6][0].data/10000).toFixed(2);//华西区
        mapChart.setOption(option);
    });

    pingAnDataServices.getData(pcIndexFactory.heavy_investment_year,pcIndexFactory.address).then(function(data){
        $(".pNumber3").text((data.values[0].data/10000).toFixed(2));
        $(".pNumber4").text((data.values[0].data/10000).toFixed(2));
    })
    pingAnDataServices.getData(pcIndexFactory.number_of_items,pcIndexFactory.address).then(function(data){
        $(".pNumber5").text(data.values[0].data);
        $(".pNumber6").text(data.values[0].data);
    })
    pingAnDataServices.getData(pcIndexFactory.cumulative_dead_area,pcIndexFactory.address).then(function(data){
        $(".pNumber7").text((data.values[0].data/10000).toFixed(2));
        $(".pNumber8").text((data.values[0].data/10000).toFixed(2));
    })

// 海外地图获取数据
    pingAnDataServices.getData(pcIndexFactory.haiwai,pcIndexFactory.address).then(function(data){
        // console.log(data);
        $scope.$broadcast('to-haiwaishuju', data);
    })

//-----------------------------------------------------------------------地图

    var mapChart = echarts.init(document.getElementById('main'));
    // mapChart的配置
    var data = [
        {name: '总部   ',    value:"      "},
        {name: '北方区 ',  value: "       "},
        {name: '华东区 ',  value: "       "},
        {name: '华中区 ',  value: "      "},
        {name: '上海区 ',  value: "      "},
        {name: '东南区 ',  value: "      "},
        {name: '华南区 ',  value: "      "},
        {name: '安德区 ',  value: "      "},
        {name: '深惠莞区  ', value: "      "},
        {name: '华西区 ',  value: "      "}

    ];

    var geoCoordMap = {
        '总部   ': [113.485998,22.456435],
        '北方区 ': [117.422444,40.01116],
        '华东区 ': [120.789149,37.005029],
        '华中区 ': [113.595806,34.865653],
        '上海区 ': [121.451452,31.280754],
        '东南区 ': [119.792821,29.222421],
        '华南区 ': [111.744003,27.314905],
        '安德区 ': [110.525889,25.60181],
        '深惠莞区  ': [115.886845,23.969577],
        '华西区 ': [104.084404,30.622711]

    };

    function convertData(data) {
        var res = [];
        for (var i = 0; i < data.length; i++) {
            var geoCoord = geoCoordMap[data[i].name];
            if (geoCoord) {
                res.push({
                    name: data[i].name,
                    value: geoCoord.concat(data[i].value)
                });
            }
        }
        return res;
    };

    function randomValue() {
        // return Math.round(Math.random() * 1000);

        //Math.round(Math.random() * 1000);
    }


    var option = {
        tooltip: {},
        visualMap: {
            show:false,
            min: 0,
            max: 400,
            left: 'left',
            top: 'bottom',
            text: ['High','Low'],
            seriesIndex: [1],
            inRange: {
                color: ['#e0ffff', '#006edd']
            },
            calculable : true
        },
        geo: {
            map: 'china',
            roam: true,
            zoom:1.4,
            scaleLimit:{min:0.7,max:1.6},

            label: {
                normal: {
                    show: true,
                    textStyle: {
                        color: 'rgba(0,0,0,0.4)'
                    }
                }
            },

            itemStyle: {
                normal:{
                    borderColor: 'rgba(0, 0, 0, 0.2)',
                    areaColor: '#ECECFF',
                    color: '#ECECFF'
                },
                emphasis:{
                    areaColor: null,
                    shadowOffsetX: 0,
                    shadowOffsetY: 0,
                    shadowBlur: 20,
                    borderWidth: 0,
                    shadowColor: 'rgba(0, 0, 0, 0.5)'
                }
            }
        },
        series: [
            {
                tooltip: {},
                type: 'scatter',
                coordinateSystem: 'geo',
                data: convertData(data),
                symbolSize: 10,
                symbolRotate: 20,

                label: {
                    normal: {
                        formatter: function (params) {
                            // console.log(params.data.value[2]);
                            var valueType = params.data.value[1] ? 'valueUp':'valueUp';
                            return "  "+ params.data.name + "         "+ '{' + valueType + '|' + params.value[2] + '} {' + null + '|}'+"  ";
                        }
                        //params.data.value[2]
                        ,

                        position: 'right',
                        distance: 15,
                        show: true,
                        // position: 'outside',
                        backgroundColor: {
                            image: 'img/lableimg.jpg',
                            height: 20,
                            weight: 115
                        },
                        top: 20,
                        padding: [4, 5],

                        borderRadius: 5,
                        borderWidth: 1,

                        borderColor: 'rgba(0,0,0,0.5)',
                        color: '#F06C00',
                        rich: {
                            valueUp: {
                                color: '#FFFFFF',
                                fontSize: 14
                            },
                        }

                    },
                    emphasis: {
                        show: true
                    },

                },

                itemStyle: {
                    normal: {
                        color: '#F06C00'
                    }
                }
            },
            {
                name: '累计已投资额(亿元)',
                type: 'map',
                geoIndex: 0,
                // tooltip: {show: true},
                data: [
                    {name: '北京', value: randomValue()},
                    {name: '天津', value: randomValue()},
                    {name: '上海', value: randomValue()},
                    {name: '重庆', value: randomValue()},
                    {name: '河北', value: randomValue()},
                    {name: '河南', value: randomValue()},
                    {name: '云南', value: randomValue()},
                    {name: '辽宁', value: randomValue()},
                    {name: '黑龙江', value: randomValue()},
                    {name: '湖南', value: randomValue()},
                    {name: '安徽', value: randomValue()},
                    {name: '山东', value: randomValue()},
                    {name: '新疆', value: randomValue()},
                    {name: '江苏', value: randomValue()},
                    {name: '浙江', value: randomValue()},
                    {name: '江西', value: randomValue()},
                    {name: '湖北', value: randomValue()},
                    {name: '广西', value: randomValue()},
                    {name: '甘肃', value: randomValue()},
                    {name: '山西', value: randomValue()},
                    {name: '内蒙古', value: randomValue()},
                    {name: '陕西', value: randomValue()},
                    // {name: '吉林', value: randomValue()},
                    // {name: '福建', value: randomValue()},
                    // {name: '贵州', value: randomValue()},
                    // {name: '广东', value: randomValue()},
                    // {name: '青海', value: randomValue()},
                    // {name: '西藏', value: randomValue()},
                    // {name: '四川', value: randomValue()},
                    // {name: '宁夏', value: randomValue()},
                    // {name: '海南', value: randomValue()},
                    // {name: '台湾', value: randomValue()},
                    // {name: '香港', value: randomValue()},
                    // {name: '澳门', value: randomValue()}
                ]
            }
        ]
    };
    $scope.$on('to-leijitouzi', function(event,data) {

        // console.log(data);
        // console.log(option.series[1].data);
        option.visualMap.max=400;
        option.series[1].name='累计已投资额(亿元)';

        for(var i=0;i<data.length;i++){
            // console.log(data[i][0]);
            // if((data[i][0].data=="N\\A")==true){
                option.series[1].data[i].name=data[i][0].data.substring(0,data[i][0].data.length-1)+'';
                option.series[1].data[i].value=data[i][1].data.toFixed(2);
            // }

            mapChart.setOption(option);
        }

        // console.log(option);


    })
    $scope.$on('to-dangniantouzi', function(event,data) {

        // console.log(data);
        // console.log(option.series[1].data);
        option.visualMap.max=100;
        option.series[1].name= '当年累计已投资额(亿元)';
        // for(var i=0;i<data.length;i++){
        //     option.series[1].data[i].name=data[i][0].data.substring(0,data[i][0].data.length-1)+''
        //     // option.series[1].data[i].value="";
        //
        //     option.series[1].data[i].value=0;
        // }
        for(var i=0;i<option.series[1].data.length;i++ ){
            option.series[1].data[i].value=0;
            mapChart.setOption(option);
        }



    })
    $scope.$on('to-yitouxiangmushu', function(event,data) {
        console.log(data);

        // console.log(data);
        // console.log(option.series[1].data);
        option.visualMap.max=25;
        option.series[1].name='已投项目数(个)';

        for(var i=0;i<data.length;i++){
            option.series[1].data[i].name=data[i][0].data.substring(0,data[i][0].data.length-1)+'';
            option.series[1].data[i].value=data[i][1].data;
            mapChart.setOption(option);
        }

    })
    $scope.$on('to-leijiyitoumianji', function(event,data) {

        console.log(data);
        console.log(option.series[1].data);
        option.visualMap.max=600;
        console.log($("#b1").css("background-color"));

            option.series[1].name='累计已投面积(万方)';


        for(var i=0;i<data.length;i++){
            if(data[i][0].data!="N\A"){
                option.series[1].data[i].name=data[i][0].data.substring(0,data[i][0].data.length-1)+'';
                option.series[1].data[i].value=data[i][1].data.toFixed(2);
                mapChart.setOption(option);
            }
        }



    })
}])


// 地图部分！
app.controller('echartMapController',["$scope",function($scope){
    $scope.zhongguo=true;
    $scope.chengeCont=function () {
        $scope.zhongguo=true;
        $("#main").css('visibility','visible');
        $("#main2").css('visibility','hidden');
        // $scope.zhongguo=!$scope.zhongguo;
    }


    var mapChart = echarts.init(document.getElementById('main2'));
    var nameMap = {
        'Afghanistan':'阿富汗',
        'Angola':'安哥拉',
        'Albania':'阿尔巴尼亚',
        'United Arab Emirates':'阿联酋',
        'Argentina':'阿根廷',
        'Armenia':'亚美尼亚',
        'French Southern and Antarctic Lands':'法属南半球和南极领地',
        'Australia':'澳大利亚',
        'Austria':'奥地利',
        'Azerbaijan':'阿塞拜疆',
        'Burundi':'布隆迪',
        'Belgium':'比利时',
        'Benin':'贝宁',
        'Burkina Faso':'布基纳法索',
        'Bangladesh':'孟加拉国',
        'Bulgaria':'保加利亚',
        'The Bahamas':'巴哈马',
        'Bosnia and Herzegovina':'波斯尼亚和黑塞哥维那',
        'Belarus':'白俄罗斯',
        'Belize':'伯利兹',
        'Bermuda':'百慕大',
        'Bolivia':'玻利维亚',
        'Brazil':'巴西',
        'Brunei':'文莱',
        'Bhutan':'不丹',
        'Botswana':'博茨瓦纳',
        'Central African Republic':'中非共和国',
        'Canada':'加拿大',
        'Switzerland':'瑞士',
        'Chile':'智利',
        'China':'中国',
        'Ivory Coast':'象牙海岸',
        'Cameroon':'喀麦隆',
        'Democratic Republic of the Congo':'刚果民主共和国',
        'Republic of the Congo':'刚果共和国',
        'Colombia':'哥伦比亚',
        'Costa Rica':'哥斯达黎加',
        'Cuba':'古巴',
        'Northern Cyprus':'北塞浦路斯',
        'Cyprus':'塞浦路斯',
        'Czech Republic':'捷克共和国',
        'Germany':'德国',
        'Djibouti':'吉布提',
        'Denmark':'丹麦',
        'Dominican Republic':'多明尼加共和国',
        'Algeria':'阿尔及利亚',
        'Ecuador':'厄瓜多尔',
        'Egypt':'埃及',
        'Eritrea':'厄立特里亚',
        'Spain':'西班牙',
        'Estonia':'爱沙尼亚',
        'Ethiopia':'埃塞俄比亚',
        'Finland':'芬兰',
        'Fiji':'斐',
        'Falkland Islands':'福克兰群岛',
        'France':'法国',
        'Gabon':'加蓬',
        'United Kingdom':'英国',
        'Georgia':'格鲁吉亚',
        'Ghana':'加纳',
        'Guinea':'几内亚',
        'Gambia':'冈比亚',
        'Guinea Bissau':'几内亚比绍',
        'Equatorial Guinea':'赤道几内亚',
        'Greece':'希腊',
        'Greenland':'格陵兰',
        'Guatemala':'危地马拉',
        'French Guiana':'法属圭亚那',
        'Guyana':'圭亚那',
        'Honduras':'洪都拉斯',
        'Croatia':'克罗地亚',
        'Haiti':'海地',
        'Hungary':'匈牙利',
        'Indonesia':'印尼',
        'India':'印度',
        'Ireland':'爱尔兰',
        'Iran':'伊朗',
        'Iraq':'伊拉克',
        'Iceland':'冰岛',
        'Israel':'以色列',
        'Italy':'意大利',
        'Jamaica':'牙买加',
        'Jordan':'约旦',
        'Japan':'日本',
        'Kazakhstan':'哈萨克斯坦',
        'Kenya':'肯尼亚',
        'Kyrgyzstan':'吉尔吉斯斯坦',
        'Cambodia':'柬埔寨',
        'South Korea':'韩国',
        'Kosovo':'科索沃',
        'Kuwait':'科威特',
        'Laos':'老挝',
        'Lebanon':'黎巴嫩',
        'Liberia':'利比里亚',
        'Libya':'利比亚',
        'Sri Lanka':'斯里兰卡',
        'Lesotho':'莱索托',
        'Lithuania':'立陶宛',
        'Luxembourg':'卢森堡',
        'Latvia':'拉脱维亚',
        'Morocco':'摩洛哥',
        'Moldova':'摩尔多瓦',
        'Madagascar':'马达加斯加',
        'Mexico':'墨西哥',
        'Macedonia':'马其顿',
        'Mali':'马里',
        'Myanmar':'缅甸',
        'Montenegro':'黑山',
        'Mongolia':'蒙古',
        'Mozambique':'莫桑比克',
        'Mauritania':'毛里塔尼亚',
        'Malawi':'马拉维',
        'Malaysia':'马来西亚',
        'Namibia':'纳米比亚',
        'New Caledonia':'新喀里多尼亚',
        'Niger':'尼日尔',
        'Nigeria':'尼日利亚',
        'Nicaragua':'尼加拉瓜',
        'Netherlands':'荷兰',
        'Norway':'挪威',
        'Nepal':'尼泊尔',
        'New Zealand':'新西兰',
        'Oman':'阿曼',
        'Pakistan':'巴基斯坦',
        'Panama':'巴拿马',
        'Peru':'秘鲁',
        'Philippines':'菲律宾',
        'Papua New Guinea':'巴布亚新几内亚',
        'Poland':'波兰',
        'Puerto Rico':'波多黎各',
        'North Korea':'北朝鲜',
        'Portugal':'葡萄牙',
        'Paraguay':'巴拉圭',
        'Qatar':'卡塔尔',
        'Romania':'罗马尼亚',
        'Russia':'俄罗斯',
        'Rwanda':'卢旺达',
        'Western Sahara':'西撒哈拉',
        'Saudi Arabia':'沙特阿拉伯',
        'Sudan':'苏丹',
        'South Sudan':'南苏丹',
        'Senegal':'塞内加尔',
        'Solomon Islands':'所罗门群岛',
        'Sierra Leone':'塞拉利昂',
        'El Salvador':'萨尔瓦多',
        'Somaliland':'索马里兰',
        'Somalia':'索马里',
        'Republic of Serbia':'塞尔维亚共和国',
        'Suriname':'苏里南',
        'Slovakia':'斯洛伐克',
        'Slovenia':'斯洛文尼亚',
        'Sweden':'瑞典',
        'Swaziland':'斯威士兰',
        'Syria':'叙利亚',
        'Chad':'乍得',
        'Togo':'多哥',
        'Thailand':'泰国',
        'Tajikistan':'塔吉克斯坦',
        'Turkmenistan':'土库曼斯坦',
        'East Timor':'东帝汶',
        'Trinidad and Tobago':'特里尼达和多巴哥',
        'Tunisia':'突尼斯',
        'Turkey':'土耳其',
        'United Republic of Tanzania':'坦桑尼亚联合共和国',
        'Uganda':'乌干达',
        'Ukraine':'乌克兰',
        'Uruguay':'乌拉圭',
        'United States of America':'美国',
        'Uzbekistan':'乌兹别克斯坦',
        'Venezuela':'委内瑞拉',
        'Vietnam':'越南',
        'Vanuatu':'瓦努阿图',
        'West Bank':'西岸',
        'Yemen':'也门',
        'South Africa':'南非',
        'Zambia':'赞比亚',
        'Zimbabwe':'津巴布韦'
    };
    var geoCoordMap = {
        // '东京': [139.759076,35.682968],
        // '波士顿': [-71.070545,42.348874],
        // '悉尼': [151.167049,-33.881479]

    };
    var data = [
        // {name: '东京',    value:"      "},
        // {name: '波士顿',    value:"      "},
        // {name: '悉尼',    value:"      "}


    ];
    function convertData(data) {
        var res = [];
        for (var i = 0; i < data.length; i++) {
            var geoCoord = geoCoordMap[data[i].name];
            if (geoCoord) {
                res.push({
                    name: data[i].name,
                    value: geoCoord.concat(data[i].value)
                });
            }
        }
        return res;
    };

    var  option = {
        // legend: {
        //     orient: 'vertical',
        //     left: 'left',
        //     data:['iphone3','iphone4','iphone5']
        // },
        tooltip: {
            trigger: 'item',
            formatter: '{b}'
        },

        geo: [
            {
                scaleLimit:{min:0.7,max:1.6},
                name: '世界地图',
                type: 'map',
                zoom:1.5,
                center: [70.7748825065,10.0820312500],
                map: 'world',
                itemStyle: {
                    normal: {
                        borderColor:'#BABABA',
                        areaColor:  '#ECECFF',
                        color: '#ECECFF'

                    }
                },
                regions: [{
                    name: '',
                    itemStyle: {
                        normal: {
                            areaColor: '#ECECFF',
                            color:  '#ECECFF'
                        }
                    }
                }],
                roam: true,
                selectedMode : 'single',
                label:{
                    normal: {
                        show:false,
                        formatter: function (params) {
                            return nameMap[params.name];
                        }
                    },
                    emphasis: {
                        label:{
                            show:true
                        }
                    }
                }
            }
        ],
        series: [
            {
                // tooltip: {},
                type: 'scatter',
                coordinateSystem: 'geo',
                data: convertData(data),
                symbolSize: 10,
                symbolRotate: 20,
                label: {
                    normal: {
                        formatter: function (params) {
                            // console.log(params.data.value[2]);
                            var valueType = params.data.value[1] ? 'valueUp':'valueUp';
                            return params.data.name + "         "+ '{' + valueType + '|' + params.value[2] + '} {' + null + '|}';
                        }
                        //params.data.value[2]
                        ,

                        position: 'right',
                        distance: 10,
                        show: true,
                        // position: 'outside',
                        backgroundColor: {
                            image: 'img/lableimg.jpg',
                            height: 30,
                            weight: 130
                        },
                        top: 20,
                        padding: [4, 5],

                        borderRadius: 5,
                        borderWidth: 1,


                        color: '#F06C00',

                        rich: {
                            valueUp: {
                                color: '#FFFFFF',
                                fontSize: 14
                            },
                        }

                    },
                    emphasis: {
                        show: true
                    },

                },
                // markLine: {
                //     show: true,
                //     length: 0.001
                // },
                // itemStyle: {
                //     normal: {
                //
                //         areaColor: '#F06C00',
                //         color: '#F06C00'
                //     }
                // }
            },
            {
                name: 'categoryA',
                type: 'map',
                geoIndex: 0,
                tooltip: {show: true},

            }
        ]
    };
    $scope.$on('to-haiwaishuju', function(event,data) {
        // console.log("haiwaishuju");
        // console.log(data);
        // console.log(option.series[0].data);
        // console.log(geoCoordMap);
        // var geoCoordMap = {
        //     '东京': [139.759076,35.682968],
        //     '波士顿': [-71.070545,42.348874],
        //     '悉尼': [151.167049,-33.881479]
        //
        // };
        var xini={
            name:"   悉尼",
            value:[151.166187,-33.88016,0]

        }
        var dongjing={
            name:"   东京",
            value:[139.713945,35.709349,0]
        }
        var boshidun={
            name:"   波士顿",
            value:[-71.061346,42.354205,0]
        }
        for (var i=0;i<data.values.length;i++){
            if(data.values[i][3].data!=0){
                // console.log(data.values[i]);
            }




            // geoCoordMap.push(
            //     data.values[i][0].data,
            //     data.values[i][1].data,data.values[i][2]
            //
            // )
if(data.values[0].length==5){
    //判断项目是否为悉尼
    if(data.values[i][1].data!=0&&data.values[i][1].data!=null&&data.values[i][1].data+3<155&&data.values[i][1].data-3>147){
        xini.value[2]=(data.values[i][4].data)+(xini.value[2]);

    }
    //判断项目是否为东京
    else if(data.values[i][1].data!=0&&data.values[i][1].data!=null&&data.values[i][1].data+3<143&&data.values[i][1].data-3>136){
        dongjing.value[2]=(data.values[i][4].data)+(dongjing.value[2]);

    }
    //判断项目是否为波士顿
    else if(data.values[i][1].data!=0&&data.values[i][1].data!=null&&Math.abs(data.values[i][1].data)+3<75&&Math.abs(data.values[i][1].data)-3>67){
        boshidun.value[2]=(data.values[i][4].data)+(boshidun.value[2]);

    }
}else{
    //判断项目是否为悉尼
    if(data.values[i][1].data!=0&&data.values[i][1].data!=null&&data.values[i][1].data+3<155&&data.values[i][1].data-3>147){
        xini.value[2]=(data.values[i][3].data)+(xini.value[2]);
        console.log(data.values[i]);
    }
    //判断项目是否为东京
    else if(data.values[i][1].data!=0&&data.values[i][1].data!=null&&data.values[i][1].data+3<143&&data.values[i][1].data-3>136){
        dongjing.value[2]=(data.values[i][3].data)+(dongjing.value[2]);

    }
    //判断项目是否为波士顿
    else if(data.values[i][1].data!=0&&data.values[i][1].data!=null&&Math.abs(data.values[i][1].data)+3<75&&Math.abs(data.values[i][1].data)-3>67){
        boshidun.value[2]=(data.values[i][3].data)+(boshidun.value[2]);

    }
}


            // if()

        }
        xini.value[2]= (xini.value[2]/10000).toFixed(2);
        dongjing.value[2]= (dongjing.value[2]/10000).toFixed(2);
        boshidun.value[2]= (boshidun.value[2]/10000).toFixed(2);

        option.series[0].data.push(xini);
        option.series[0].data.push(dongjing);
        option.series[0].data.push(boshidun);
        mapChart.setOption(option);

//         var data = [
//             {name: '东京',    value:"      "},
//             {name: '波士顿',    value:"      "},
//             {name: '悉尼',    value:"      "}
// ]
    });
    // mapChart.setOption(option);

}]);

function zhongguo() {
    $("#cause2").css('display','none');
    $("#cause1").css('display','block');
    // $this.css('backgroundcolor','#ccc');
    // $this.style.backgroundColor='#d8e1e3'
    document.getElementById("b1").style.backgroundColor='#fff';
    document.getElementById("b2").style.backgroundColor='#d8e1e3';

}
// function haiwaiditu() {
//     $(".bodyerSpan").text("累计已投资额(亿元)");
//     $(".contentTop").removeClass("contentTopActive contentTopActive1 contentTopActive2 contentTopActive3");
//     $("#haiwaitiao").addClass("contentTopActive");
//     $("#cause2").css('display','block');
//     $("#cause1").css('display','none');
//     // $this.style.backgroundColor='#d8e1e3'
//     document.getElementById("b2").style.backgroundColor='#fff';
//     document.getElementById("b1").style.backgroundColor='#d8e1e3';
//
//
// }