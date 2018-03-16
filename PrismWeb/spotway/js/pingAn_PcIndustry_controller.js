var app=angular.module('pingAn_PcIndustry', ['pingAnServices','ngDialog','app.services']);
app.controller("pingAnIndustryController",["$scope","$http","pingAnDataServices","pcIndustryFactory",function($scope,$http,pingAnDataServices,pcIndustryFactory){
	/*数据*/
	pingAnDataServices.getData(pcIndustryFactory.zhibiao,pcIndustryFactory.address).then(function(data){
//		console.log(data.values);
		$scope.xiangmushu=data.values[4][1].data;
		$scope.mianji=data.values[3][1].data.toFixed(2);
		$scope.mianji1=data.values[2][1].data.toFixed(2);
		$scope.guimo=data.values[1][1].data.toFixed(2);
		$scope.jine=data.values[0][1].data.toFixed(2)
	})


    $scope.fanhuijiuban=function(){
        $scope.dashboards='/dashboards/58d3cdc55203d04c0c001ff9?filter=';
        $http.post('/api/funAuth/otherVision',{'username': $scope.user.userName,'dashboards':$scope.dashboards}).then(function(response,status){
            console.log(response);
            window.open(response.data,"_blank");
        })
    }
	/*柱图*/
	// let arr=[2,3,4];
	// for(let x=0;x<arr.length;x++){
	// 	var myChartx = echarts.init(document.getElementsByClassName("top_zhibiao_tu")[arr[x]], 'bar'),option;
	// 	option = {
	// 		color: ['#3398DB'],
	// 		tooltip : {
	// 			trigger: 'axis',
	// 			axisPointer : {            // 坐标轴指示器，坐标轴触发有效
	// 				type : 'shadow'        // 默认为直线，可选为：'line' | 'shadow'
	// 			}
	// 		},
	// 		grid: {
	// 			left: '-30',
	// 			right: '0',
	// 			top:'0',
	// 			bottom: '0',
	// 			containLabel: true
	// 		},
	// 		xAxis : [
	// 			{
	// 				/*axisLabel: {
	// 				 show: true,
	// 				 textStyle: {
	// 				 color: 'red'
	// 				 }
	// 				 },*/
	// 				type : 'category',
	// 				data : ['KPI', '实际'],
	// 				axisTick: {
	// 					alignWithLabel: 0
	// 				},
	// 				splitLine:{
	// 					show:false
	// 				},
	// 			}
	// 		],
	// 		yAxis : [
	// 			{
	// 				min:0,
	// 				max:100,
	// 				type : 'value',
	// 				show:false,
	// 				splitLine:{
	// 					show:false
	// 				},
	// 			}
	// 		],
	// 		itemStyle: {
	// 			//通常情况下：
	// 			normal:{
	// 				color:'#23B6E9',
	// 			}
	// 		},
	// 		series : [
	// 			{
	// 				// name:'value',
	// 				type:'bar',
	// 				barWidth: '20',
	// 				data:[{
	// 					value:50,
	// 					itemStyle:{
	// 						normal:{
	// 							color:'#FF4700'
	// 						}
	// 					}
	// 				},{
	// 					value:80,
	// 					itemStyle:{
	// 						normal:{
	// 							color:'#49CEED'
	// 						}
	// 					}
	// 				}]
	// 			}
	// 		]
	// 	};
	// 	myChartx.setOption(option);
	// }
	/*表格*/
	$scope.func=function(header,body,el){
		let thead="",bodyx={},tbodyx="",htmlx="";
		for(let x=0;x<header.length;x++){
			thead+="<td style='font-weight: bold;color: black'>"+(header[x]==="N\\A"?"":header[x])+"</td>";
			for(let z=0;z<body.length;z++){
				if(isNaN(body[z][x].data)){
					bodyx['tbody'+z]+="<td>"+body[z][x].data+"</td>"
				}else{
					bodyx['tbody'+z]+="<td>"+body[z][x].data.toFixed(2)+"</td>"
				}
			}
		}
		thead="<tr style='font-weight: bold;color: black'>"+thead+"</tr>";
		for(let z=0;z<body.length;z++){
			bodyx['tbody'+z]="<tr>"+bodyx['tbody'+z]+"</tr>";
		}
		for(let z=0;z<body.length;z++){
			tbodyx+=bodyx['tbody'+z];
		}
		$(el).empty().append(thead+tbodyx);
	}
	pingAnDataServices.getData(pcIndustryFactory.touzi,pcIndustryFactory.address).then(function(data){
		$scope.func(data.headers,data.values,".Industry .footer_left_table:first");
	})
	$scope.touzix=function(){
		$(".Industry .footer_left_table:first").empty();
		$(".Industry .footer_right_table:first").empty();
		pingAnDataServices.getData(pcIndustryFactory.touzi,pcIndustryFactory.address).then(function(data){
			$scope.func(data.headers,data.values,".Industry .footer_left_table:first");
		})
	}
	$scope.gongchengx=function(){
		$(".Industry .footer_left_table:first").empty();
		$(".Industry .footer_right_table:first").empty();
		pingAnDataServices.getData(pcIndustryFactory.gongcheng,pcIndustryFactory.address).then(function(data){
			$scope.func(data.headers,data.values,".Industry .footer_left_table:first");
		})
		pingAnDataServices.getData(pcIndustryFactory.gongcheng1,pcIndustryFactory.address).then(function(data){
			$scope.func(data.headers,data.values,".Industry .footer_right_table:first");
		})
	}
	$scope.zhaoshangx=function(){
		$(".Industry .footer_left_table:first").empty();
		$(".Industry .footer_right_table:first").empty();
		pingAnDataServices.getData(pcIndustryFactory.zhaoshang,pcIndustryFactory.address).then(function(data){
			$scope.func(data.headers,data.values,".Industry .footer_left_table:first");
		})
		pingAnDataServices.getData(pcIndustryFactory.zhaoshang1,pcIndustryFactory.address).then(function(data){
			$scope.func(data.headers,data.values,".Industry .footer_right_table:first");
		})
	}
	$scope.hezuox=function(){
		$(".Industry .footer_left_table:first").empty();
		$(".Industry .footer_right_table:first").empty();
		pingAnDataServices.getData(pcIndustryFactory.hezuo,pcIndustryFactory.address).then(function(data){
			$scope.func(data.headers,data.values,".Industry .footer_left_table:first");
		})
	}
	$scope.yichangx=function(){
		$(".Industry .footer_left_table:first").empty();
		$(".Industry .footer_right_table:first").empty();
		pingAnDataServices.getData(pcIndustryFactory.yichang,pcIndustryFactory.address).then(function(data){
            console.log(data.values);
            // var data1=[]
            $scope.func(data.headers,data.values,".Industry .footer_left_table:first");
            zidiaoyong();
            function zidiaoyong(){
            	$(".footer_left_table:first tr").each(function(index,obj){
            		$(obj).children("td:last").remove()
				})
			}
		})
		pingAnDataServices.getData(pcIndustryFactory.yichang1,pcIndustryFactory.address).then(function(data){
			$(".Industry .footer_right_table:first").append(data.table);
            huidiao();
            zidiaoyong();
            function zidiaoyong(){
                $(".footer_right_table:first tr").each(function(index,obj){
                    $(obj).children("td:last").remove()
                })
            }
		})
		function huidiao(){
            $(".footer_right tr").each(function(index,obj){
                $(obj).find("td:first").css("width","20%");
                // $(obj).find("tr:first").css("font-weight","bold");
                $(obj).find("td").eq(1).css("width","15%");
            })
		}
	}
	$scope.yunyingx=function(){
		$(".Industry .footer_left_table:first").empty();
		$(".Industry .footer_right_table:first").empty();
		pingAnDataServices.getData(pcIndustryFactory.yunying,pcIndustryFactory.address).then(function(data){
			$scope.func(data.headers,data.values,".Industry .footer_left_table:first");
		})
	}
	$(".Industry .footer_right").css("display","none");
	$(".Industry .footer_nav:first>div:first").addClass("active");
	$(".Industry .footer_left_title").text("投资概览");
	$(".Industry .footer_right_title").css("display","none");
	$(".Industry .footer_left:first").css("width","100%");
	$(".Industry .footer_nav:first>div").each(function(index,obj){
		$(obj).click(function(){
			$(obj).addClass("active").siblings().removeClass("active");
			if(index==0){
				$(".Industry .footer_left_title").text("投资概览");
				$(".Industry .footer_right_title").css("display","none");
				$(".Industry .footer_right").css("display","none");
				$(".Industry .footer_left:first").css("width","100%");
                $scope.biaogefuyuan()
			}else if(index==1){
				$(".Industry .footer_left_title").text("工程及物业资产概览");
				$(".Industry .footer_right_title").text("工程及物业资产概览").css("display","block");
				$(".Industry .footer_right").css("display","block");
				$(".Industry .footer_left:first").css("width","60%");
			}else if(index==2){
				$(".Industry .footer_left_title").text("招商概览");
				$(".Industry .footer_right_title").text("当期退租/中止").css("display","block");
				$(".Industry .footer_right").css("display","block");
				$(".Industry .footer_left:first").css("width","60%");
                $scope.biaogefuyuan()
			}else if(index==3){
				$(".Industry .footer_left_title").text("合作方跟投欠缴概览");
				$(".Industry .footer_right_title").css("display","none");
				$(".Industry .footer_right").css("display","none");
				$(".Industry .footer_left:first").css("width","100%");
                $scope.biaogefuyuan()
			}else if(index==4){
				$(".Industry .footer_left_title").text("延期项目概览");
				$(".Industry .footer_right_title").text("异常未开工项目").css("display","block");
				$(".Industry .footer_right").css("display","block");
				$(".Industry .footer_left:first").css("width","60%");

                $scope.biaogeyangshi();
			}else if(index==5){
				$(".Industry .footer_left_title").text("运营项目NOI概览");
				$(".Industry .footer_right_title").css("display","none");
				$(".Industry .footer_right").css("display","none");
				$(".Industry .footer_left:first").css("width","100%");
                $scope.biaogefuyuan()
			}
		})
	})
	$scope.biaogeyangshi=function(){
		$(".Industry footer").css({
			"display":"block",
		})
		$(".Industry .footer_left").css({
			"width":"100%",
			"padding":"0"
		})
        $(".Industry .footer_right").css({
            "width":"100%",
			"margin-top":"50px"
        })
        $(" .footer_left tbody tr:first-child").css("width","30%%");
	}
	$scope.biaogefuyuan=function(){
        $(".Industry footer").css({
            "display":"flex",
        })
        $(".Industry .footer_left").css({
            "width":"60%%",
            "padding":"0 22px 0 0"
        })
        $(".Industry .footer_right").css({
            "width":"40%",
            "margin-top":"0"
        })
	}
}])