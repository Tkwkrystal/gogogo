var app=angular.module('pingAn_PcFinance', ['pingAnServices','ngDialog','app.services']);
app.controller("pingAnFinanceController",["$scope","$http","pingAnDataServices","pcFinanceFactory",function($scope,$http,pingAnDataServices,pcFinanceFactory){

    $scope.fanhuijiubankaifa=function(){
        $scope.dashboards='/dashboards/594208d208faaea0290001f5?filter=';
        $http.post('/api/funAuth/otherVision',{'username': $scope.user.userName,'dashboards':$scope.dashboards}).then(function(response,status){
            console.log(response);
            window.open(response.data,"_blank");
        })
    }


	pingAnDataServices.getData(pcFinanceFactory.actual_investment_scale,pcFinanceFactory.address).then(function(data){
		// console.log(data);
		$scope.pFont=(data.values[0].data/100000000).toFixed(2)
	})

	pingAnDataServices.getData(pcFinanceFactory.credit_debt,pcFinanceFactory.address).then(function(data){
		console.log(data.values);
        // console.log(data.values.length);
		// $scope.creditDebt=(data.values[0][0].data/100000000).toFixed(2);
		// $scope.notStock=(data.values[2][0].data/100000000).toFixed(2);
		// $scope.stock=(data.values[1][0].data/100000000).toFixed(2);

		var myChartx1= echarts.init(document.getElementsByClassName("top_zhibiao_tu")[1], 'pie'),option;
		option = {
			color:['#FF9427','#807F75','#FFC52D'],
			series : [
				{
					type: 'pie',
					radius : '70%',
					center: ['50%', '50%'],
					legendHoverLink :true,
					hoverAnimation :false,
					data:[
						{value:(data.values[0][0].data/100000000).toFixed(2)},
						{value: 0},
						{value: 0},
					],
					itemStyle: {
						emphasis: {
							shadowBlur: 0,
						}
					},
					label:{
						normal:{
							show:true,
							position:'inside',
							formatter :function(params){
								return params.percent.toFixed(0)+"%"
							}
						},
					},
					labelLine:{
						normal:{
							show:false
						}
					}
				}
			]
		};
        for(var i=0;i<data.values.length;i++){
            if(data.values[i][1].data=='信用债'){
                $scope.creditDebt=(data.values[i][0].data/100000000).toFixed(2);
                option.series[0].data[0].value=$scope.creditDebt
            }else if(data.values[i][1].data=='抵质押债非合股'){
                $scope.notStock=(data.values[i][0].data/100000000).toFixed(2);
                option.series[0].data[1].value=$scope.notStock
            }else if(data.values[i][1].data=='抵质押债-合股'){
                $scope.stock=(data.values[i][0].data/100000000).toFixed(2);
                option.series[0].data[2].value=$scope.stock
            }
        }
        console.log($scope.creditDebt);
        myChartx1.setOption(option);
	})

	pingAnDataServices.getData(pcFinanceFactory.bingtu2,pcFinanceFactory.address).then(function(data){
		// console.log(data.values.length);

		// $scope.valuetext1=(data.values[0][0].data);
		// $scope.value1=(data.values[0][1].data).toFixed(2);
		// $scope.valuetext2=(data.values[1][0].data);
		// $scope.value2=(data.values[1][1].data).toFixed(2);
		// $scope.valuetext3=(data.values[2][0].data);
		// $scope.value3=(data.values[2][1].data).toFixed(2);

		var myChartx2= echarts.init(document.getElementsByClassName("top_zhibiao_tu")[2], 'pie'),option;
		option = {
			color:['#FF5721','#FFA027','#93908B'],
			series : [
				{
					type: 'pie',
					radius : '70%',
					center: ['50%', '50%'],
					legendHoverLink :true,
					hoverAnimation :false,
					data:[
						{value:0},
						{value:(data.values[0][1].data).toFixed(2)},
						{value:0}
					],
					itemStyle: {
						emphasis: {
							shadowBlur: 0,
						}
					},
					label:{
						normal:{
							show:true,
							position:'inside',
							formatter :function(params){
								return params.percent.toFixed(0)+"%"
							}
						},
					},
					labelLine:{
						normal:{
							show:false
						}
					}
				}
			]
		};
        for(var i=0;i<data.values.length;i++){
            if(data.values[i][0].data=='6个月'){
                $scope.value1=(data.values[i][1].data).toFixed(2);
                option.series[0].data[0].value=$scope.value1
            }else if(data.values[i][0].data=='大于6个月'){
                $scope.value2=(data.values[i][1].data).toFixed(2);
                option.series[0].data[1].value=$scope.value2
            }else if(data.values[i][0].data=='小于6个月'){
                $scope.value3=(data.values[i][1].data).toFixed(2);
                option.series[0].data[2].value=$scope.value3
            }
        }
        // console.log(option.series[0].data[0].value);

        myChartx2.setOption(option);
	})

	pingAnDataServices.getData(pcFinanceFactory.tiaoxingtu,pcFinanceFactory.address).then(function(data){
		var xArr=new Array();
		var yArr=new Array();
		for(var m=0;m<data.values.length;m++){
			xArr.push(data.values[m][0].text);
		};
		for(var i=0;i<data.values.length;i++){
			yArr.push(data.values[i][1].data.toFixed(2));
		}
		var myChartx3= echarts.init(document.getElementsByClassName("footer_left_bottom")[0], 'bar'),option;
		option = {
			color: ['#FF9427'],
			tooltip : {
				trigger: 'axis',
				axisPointer : {
					type : 'shadow'
				}
			},
			grid: {
				right:'3%',
				containLabel: false
			},
			xAxis : [
				{
					type : 'category',
					data : xArr,
					axisTick: {
						show:false,
					},
					axisLine:{
						show:false,
					},
					axisLabel:{
						show:true,
						interval :0,
						rotate:-45
					}
				}
			],
			yAxis : [
				{
					type : 'value',
					axisTick: {
						show:false,
					},
					axisLine:{
						show:false,
					},
				}
			],
			label:{
				normal:{
					show:true,
					position:'top',
					color:'#353636'
				}
			},
			series : [
				{
					type:'bar',
					barWidth: '30',
					data:yArr
				}
			]
		};
		myChartx3.setOption(option);
	})

	pingAnDataServices.getData(pcFinanceFactory.table_money,pcFinanceFactory.address).then(function(data){
		// $scope.pFont=(data.values[0].data/100000000).toFixed(2)
		var array = data.values;
		$.each(array, function (i, item) {
			var tr = $("<tr><td>" + (array[i][0].data).substr(0,7) + "</td><td>" + ((array[i][1].data)/100000000).toFixed(2) + "</td><td>" + (array[i][2].data/100000000).toFixed(2) + "</td></tr>");
			$(".footerTbody").append(tr);
		});
	})
	var myChartx = echarts.init(document.getElementsByClassName("top_zhibiao_tu")[0], 'bar'),option;
	option = {
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
				// name:'value',
				type:'bar',
				barWidth: '20',
				data:[{
					value:50,
					itemStyle:{
						normal:{
							color:'#FF4700'
						}
					}
				},{
					value:80,
					itemStyle:{
						normal:{
							color:'#49CEED'
						}
					}
				}]
			}
		]
	};
	myChartx.setOption(option);
	$scope.$root.pageshow=true;
	$scope.pageshowx=function(){
		$scope.$root.pageshow=!$scope.$root.pageshow;
        setTimeout(function(){
            $(".pingAn .contentTable .contentTable_top").css({
                width:$(".pingAn .contentTable .tBodyer tr").eq(1).width()
            })
        },10)
	}
	// $scope.isActive='xx1';
	$(window).resize(function(){
		$(".Finance .footer_right_bottom_top").css({
			"width":$(".Finance .footer_right_bottom .footerTbody").width()
		})
	})
	$(".Finance .footer_right_bottom_top").css({
		"width":$(".Finance .footer_right_bottom .footerTbody").width()
	})
}])
	

	app.controller('pingAnInsuranceController',["$scope","$http","pingAnDataServices","pcInsuranceFactory",function ($scope,$http,pingAnDataServices,pcInsuranceFactory) {
	   $scope.pageshowxx=function(){
			$scope.$root.pageshow=!$scope.$root.pageshow;
			setTimeout(function(){
                $(".Finance .footer_right_bottom_top").css({
                    "width":$(".Finance .footer_right_bottom .footerTbody").width()
                })
			},10)
		};
        $scope.fanhuijiubanjinrong=function(){
            $scope.dashboards='/dashboards/597f0cefdd0d7e983d000010?filter=';
            $http.post('/api/funAuth/otherVision',{'username': $scope.user.userName,'dashboards':$scope.dashboards}).then(function(response,status){
                console.log(response);
                window.open(response.data,"_blank");
            })
        }
	    pingAnDataServices.getData(pcInsuranceFactory.real_investment,pcInsuranceFactory.address).then(function(data){
	        // console.log(data.values);
	        $scope.pFont=(data.values[0].data/10000).toFixed(2)
	    })
		pingAnDataServices.getData(pcInsuranceFactory.leijishitou,pcInsuranceFactory.address).then(function(data){
	        $scope.pFontx=(data.values[0].data).toFixed(2)
	    })
	    pingAnDataServices.getData(pcInsuranceFactory.tablenew,pcInsuranceFactory.address).then(function(data){
	        // $(".bodyerTable tbody").empty();
	        /*var array = data.values;
	        $.each(array, function (i, item) {
	            var tr = $("<tr><td>" + array[i][0].data + "</td><td>" + (array[i][1].data).substr(0,10) + "</td><td>" + array[i][2].data + "</td><td>" + array[i][3].data + "</td><td>" + (array[i][4].data/10000).toFixed(2) + "</td></tr>");
	            $(".tBodyer").append(tr);
	        });*/
			$(".tBodyer").append(data.table);
	    });
		$(window).resize(function(){
			$(".pingAn .contentTable .contentTable_top").css({
				width:$(".pingAn .contentTable .tBodyer tr").eq(1).width()
			})
		})
		$(".pingAn .contentTable .contentTable_top").css({
			width:$(".pingAn .contentTable .tBodyer tr").eq(1).width()
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
	                // name:'value',
	                type:'bar',
	                barWidth: '20',
	                data:[{
						value:50,
						itemStyle:{
							normal:{
								color:'#FF4700'
							}
						}
					},{
						value:80,
						itemStyle:{
							normal:{
								color:'#49CEED'
							}
						}
					}]
	            }
	        ]
	    };
	    mapChart.setOption(option1)
	}])
