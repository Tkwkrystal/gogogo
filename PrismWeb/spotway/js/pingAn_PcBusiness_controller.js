'use strict';
var app = angular.module('pingAn_PcBusiness', ['pingAnServices', 'ngDialog', 'app.services']);
app.controller('pingAn_PcBusiness', ['$scope', "$http", "pingAnDataServices", "pcBusinessFactory","tableHeaderHelper", function($scope,$http, pingAnDataServices, pcBusinessFactory, tableHeaderHelper) {
    $scope.tiaozhuanleixing=0;
    // $scope.dashboards='/dashboards/58b7d20dadf889d8160011a3/';
//跳转到5.7具体下项目
    $scope.tiaozhuan=function (projectName) {
        $scope.canshu='[{"jaql":{"table":"维度表_项目立项","column":"项目名称","dim":"[维度表_项目立项.项目名称]","datatype":"text","merged":true,"title":"项目名称","filter":{"members":["'+projectName+'"]}}}]';

        // $scope.dashboards='/dashboards/58b7d20dadf889d8160011a3/';
        if($scope.tiaozhuanleixing==2||$scope.tiaozhuanleixing==7||$scope.tiaozhuanleixing==8||$scope.tiaozhuanleixing==9){
           console.log($scope.tiaozhuanleixing);
            pingAnDataServices.getData(pcBusinessFactory.zichanchihuibaotiaozhuan, pcBusinessFactory.address).then(function(data) {
                //console.log(data);
                var dashboards='/dashboards/';
                for(var i=0;i<data.values.length;i++){
                    if (projectName==data.values[i][0].data){
                        if(data.values[i][1].data=="ASSET_MANAGEMENT"){
                            dashboards='/dashboards/58b7d20dadf889d8160011a3/';
                            $http.post('/api/funAuth/otherVision',{'username': $scope.user.userName,'dashboards':dashboards,'canshu':$scope.canshu}).then(function(response,status){
                                //console.log(response);
                                window.open(response.data,"_blank");
                            })
                        }else{
                            dashboards='/dashboards/58b8e2aba3b1f4d41200018a/';
                            $http.post('/api/funAuth/otherVision',{'username': $scope.user.userName,'dashboards':dashboards,'canshu':$scope.canshu}).then(function(response,status){
                                //console.log(response);
                                window.open(response.data,"_blank");
                            })
                            break;
                        }
                    }
                }
            });
        }
       else if($scope.tiaozhuanleixing==0||$scope.tiaozhuanleixing==1||$scope.tiaozhuanleixing==4||$scope.tiaozhuanleixing==5||$scope.tiaozhuanleixing==6){
            $scope.dashboards='/dashboards/59e7489e0e6c5d182a000210/';
            $scope.canshu='[{"jaql":{"table":"维度表_项目立项","column":"项目名称","dim":"[维度表_项目立项.项目名称]","datatype":"text","merged":true,"title":"项目名称","filter":{"members":["'+projectName+'"]}}}]';
            // $scope.canshu=encodeURI ($scope.canshu);
            // console.log($scope.canshu);
            // $scope.filter=$scope.dashboards.concat($scope.canshu);
            // console.log($scope.filter);
            $http.post('/api/funAuth/otherVision',{'username': $scope.user.userName,'dashboards':$scope.dashboards,'canshu':$scope.canshu}).then(function(response,status){
                //console.log(response);
                window.open(response.data,"_blank");
            })
        }
        else if($scope.tiaozhuanleixing==3){
            pingAnDataServices.getData(pcBusinessFactory.guanliguimotiaozhuan, pcBusinessFactory.address).then(function(data) {
                //console.log(data);
                var dashboards='/dashboards/';
                for(var i=0;i<data.values.length;i++){
                    if (projectName==data.values[i][0].data){
                        if(data.values[i][1].data=="ASSET_MANAGEMENT"){
                            dashboards='/dashboards/58b7d20dadf889d8160011a3/';
                            $http.post('/api/funAuth/otherVision',{'username': $scope.user.userName,'dashboards':dashboards,'canshu':$scope.canshu}).then(function(response,status){
                                //console.log(response);
                                window.open(response.data,"_blank");
                            })
                        }else if(data.values[i][1].data=="BUSINESS_MANAGEMENT") {
                            dashboards='/dashboards/58b8e2aba3b1f4d41200018a/';
                            $http.post('/api/funAuth/otherVision',{'username': $scope.user.userName,'dashboards':dashboards,'canshu':$scope.canshu}).then(function(response,status){
                                //console.log(response);
                                window.open(response.data,"_blank");
                            })
                            break;
                        }else {
                            dashboards='/dashboards/59e7489e0e6c5d182a000210/';
                            $http.post('/api/funAuth/otherVision',{'username': $scope.user.userName,'dashboards':dashboards,'canshu':$scope.canshu}).then(function(response,status){
                                //console.log(response);
                                window.open(response.data,"_blank");
                            })
                            break;
                        }
                    }
                }
            });

        }

        //console.log('/api/funAuth/otherVision');
    }
//跳转到5.7事业部主页
    $scope.fanhuijiubantouzi=function(){
        $scope.dashboards='/dashboards/58c9fb19d296eb0009000161/';
        $http.post('/api/funAuth/otherVision',{'username': $scope.user.userName,'dashboards':$scope.dashboards}).then(function(response,status){
            console.log(response);
            window.open(response.data,"_blank");
        })
    }
//跳转到5.7事业部主页
    $scope.fanhuijiubanziguan=function(){
        $scope.dashboards='/dashboards/58a6b1f8f7dcb54404000090/';
        $http.post('/api/funAuth/otherVision',{'username': $scope.user.userName,'dashboards':$scope.dashboards}).then(function(response,status){
            console.log(response);
            window.open(response.data,"_blank");
        })
    }

    //截取权益前后表格第一行多出的字
    $scope.quanyiqianjiequ=function(el){
        for(let x=1;x<$(el).children("tr").eq(0).children().length;x++){
            let text=$(el).children("tr").eq(0).children()
            text.eq(x).text(text.eq(x).text().split("权益前")[1])
        }
    }
    $scope.quanyihoujiequ=function(el){
        for(let x=1;x<$(el).children("tr").eq(0).children().length;x++){
            let text=$(el).children("tr").eq(0).children()
            text.eq(x).text(text.eq(x).text().split("权益后")[1])
        }
    }

    //指标NaN转换
    $scope.zhibiaoNaN=function(count){
        if(isNaN(count)) {
            return "—"
        }else{
            return count
        }
    }

    $scope.tiaoxingdianji="";
    //  函数
    $scope.xianshi=true;
    $scope.func = function(header, body, el, hejix, factiaojian,pingjun,tiaozhuan,baifenbi) {
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
                if(header[x].indexOf("/")>=0){
                    thead += "<td  style='border-right:1px solid #c5c4c5;border-left:1px solid #c5c4c5'>" + (header[x] === "N\\A" ? "" : header[x].substring(0,header[x].indexOf("/"))) + "<span class='jiantou glyphicon glyphicon-chevron-down' style='color:gray;opacity:.5;width:20px;height:20px'></span></td>";
                }else if(header[x].indexOf("%")>=0){
                    thead += "<td  style='border-right:1px solid #c5c4c5;border-left:1px solid #c5c4c5'>" + (header[x] === "N\\A" ? "" : header[x].substring(0,header[x].indexOf("%"))) + "<span class='jiantou glyphicon glyphicon-chevron-down' style='color:gray;opacity:.5;width:20px;height:20px'></span></td>";
                }else if(header[x].indexOf("城市")>=0){
                    thead += "<td  style='border-right:1px solid #c5c4c5;border-left:1px solid #c5c4c5'>" + (header[x] === "N\\A" ? "" : header[x].substring(2)) + "<span class='jiantou glyphicon glyphicon-chevron-down' style='color:gray;opacity:.5;width:20px;height:20px'></span></td>";
                }else{
                    thead += "<td  style='border-right:1px solid #c5c4c5;border-left:1px solid #c5c4c5'>" + (header[x] === "N\\A" ? "" : header[x]) + "<span class='jiantou glyphicon glyphicon-chevron-down' style='color:gray;opacity:.5;width:20px;height:20px'></span></td>";
                }
            }else{
                if(header[x].indexOf("/")>=0){
                    thead += "<td  style='border-right:1px solid #c5c4c5;border-left:1px solid #c5c4c5'>" + (header[x] === "N\\A" ? "" : header[x].substring(0,header[x].indexOf("/"))) + "</td>";
                }else if(header[x].indexOf("%")>=0){
                    thead += "<td  style='border-right:1px solid #c5c4c5;border-left:1px solid #c5c4c5'>" + (header[x] === "N\\A" ? "" : header[x].substring(0,header[x].indexOf("%"))) + "</td>";
                }else if(header[x].indexOf("城市")>=0){
                    thead += "<td  style='border-right:1px solid #c5c4c5;border-left:1px solid #c5c4c5'>" + (header[x] === "N\\A" ? "" : header[x].substring(2)) + "</td>";
                }else{
                    thead += "<td  style='border-right:1px solid #c5c4c5;border-left:1px solid #c5c4c5'>" + (header[x] === "N\\A" ? "" : header[x]) + "</td>";
                }
            }

            // thead += "<td  style='border-right:1px solid #c5c4c5;border-left:1px solid #c5c4c5'>" + (header[x] === "N\\A" ? "" : header[x]) + "</td>";
            hejiz['heji' + x]=0;
            for(let z = 0; z < body.length; z++) {
                if(Number.isInteger(body[z][x].data)){
                    if(isNaN(body[z][x].data)) {
                        body[z][x].data=="N\\A"||body[z][x].data=="NaN"?bodyx['tbody' + z] += "<td style='border-right:1px solid #c5c4c5;border-left:1px solid #c5c4c5'>"+body[z][x].data+"</td>":bodyx['tbody' + z] += "<td style='border-right:1px solid #c5c4c5;border-left:1px solid #c5c4c5'><a style='text-decoration:none' class='xiangxi'>" + body[z][x].data + "</a></td>"
                    } else {
                        try{
                            bodyx['tbody' + z] += "<td style='border-right:1px solid #c5c4c5;border-left:1px solid #c5c4c5'>" +body[z][x].data + "</td>";
                            hejiz['heji' + x]+=body[z][x].data*1;
                        }catch(err){
                            bodyx['tbody' + z] += "<td style='border-right:1px solid #c5c4c5;border-left:1px solid #c5c4c5'>" +body[z][x].data + "</td>";
                            hejiz['heji' + x]+=body[z][x].data*1;
                        }
                    }
                }else{
                    if(isNaN(body[z][x].data)) {
                        body[z][x].data=="N\\A"||body[z][x].data=="NaN"?bodyx['tbody' + z] += "<td style='border-right:1px solid #c5c4c5;border-left:1px solid #c5c4c5'>"+body[z][x].data+"</td>":bodyx['tbody' + z] += "<td style='border-right:1px solid #c5c4c5;border-left:1px solid #c5c4c5'><a style='text-decoration:none' class='xiangxi'>" + body[z][x].data + "</a></td>"

                    } else {
                        try{
                            bodyx['tbody' + z] += "<td style='border-right:1px solid #c5c4c5;border-left:1px solid #c5c4c5'>" +body[z][x].data.toFixed(2) + "</td>";
                            hejiz['heji' + x]+=body[z][x].data*1;
                        }catch(err){
                            bodyx['tbody' + z] += "<td style='border-right:1px solid #c5c4c5;border-left:1px solid #c5c4c5'>" +body[z][x].data + "</td>";
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
                heji+="<td style='border-right:1px solid #c5c4c5;border-left:1px solid #c5c4c5;color:#27ADFE'>" + hejiz['heji' + z] + "</td>"

            }else{
                heji+="<td style='border-right:1px solid #c5c4c5;border-left:1px solid #c5c4c5;color:#27ADFE'>" + hejiz['heji' + z].toFixed(2) + "</td>"
            }
        }
        heji="<tr><td style='border-right:1px solid #c5c4c5;border-left:1px solid #c5c4c5;color:#27ADFE'>合计</td>"+heji+"</tr>";
        hejix ? tbodyx += heji : "";
        $(el).empty().append(thead + tbodyx);
        $(".xiangxi").each(function(indexx,objx){
            if(tiaozhuan){
                $(objx).click(function(){
                    $scope.tiaozhuan($(objx).text())
                })
            }else {
                $(objx).click(function () {
                    pcBusinessFactory[factiaojian].metadata.pop();
                    pcBusinessFactory[factiaojian].metadata.push({
                        "jaql": {
                            "table": "商业事业部业务指标",
                            "column": "company",
                            "dim": "[商业事业部业务指标.company]",
                            "datatype": "text",
                            "merged": true,
                            "title": "company",
                            "filter": {
                                "explicit": true,
                                "multiSelection": false,
                                "members": [
                                    "" + $(objx).text() + ""
                                ]
                            },
                            "collapsed": false
                        },
                        "panel": "scope"
                    })
                    var arrx = [];
                    if (pingjun) {
                        [function () {
                            for (let x = 1; x < $(objx).parent().parent().children("td").length; x++) {
                                arrx.push($(objx).parent().parent().children("td").eq(x).text())
                            }
                        }()]
                    }
                    console.log(arrx)
                    pingAnDataServices.getData(pcBusinessFactory[factiaojian], pcBusinessFactory.address).then(function (data) {
                        let lasttable=$(".tBodyer:first tr").clone(true);
                        $(".table_back").css("display","none")
                        $scope.func(data.headers, data.values, ".tBodyer:first", 1,null,pingjun,1,baifenbi);
                        $(".table_back").css("display","inline").click(function(){
                            $(".tBodyer:first").empty().append(lasttable);
                            $(".table_back").css("display","none")
                        })
                        if (pingjun) {
                            [function () {
                                for (let x = 1; x < $(el).find("tr:last td").length; x++) {
                                    $(el).find("tr:last td").eq(x).text(arrx[x - 1])
                                }
                            }()]
                        }
                    });
                })
            }
        })
        $(el).find("tr").each(function(index,obj){
            y=0;
            //判断数字是否都为0
            for(let x=1;x<$(obj).children("td").length;x++){
                if($(obj).children("td").eq(x).text()==="0.00"||$(obj).children("td").eq(x).text()==="-0.00"){
                    y++
                }
            }
            //NaN该为-
            for(let x=0;x<$(obj).children("td").length;x++){
                if($(obj).children("td").eq(x).text()=="N\\A"||$(obj).children("td").eq(x).text()=="NaN"){
                    $(obj).children("td").eq(x).text(0)
                }
            }
            //最后一列如果是删除
            if($(el).find("tr").eq(0).children("td:last").text()=="城市"){
                if(y==$(obj).children("td").length-2){
                    $(obj).remove()
                }
             //如果数据都为0这行删了
            }else{
                if(y==$(obj).children("td").length-1){
                    $(obj).remove()
                }
            }
        })
        //判断数据是否需要加百分比符号
        if(baifenbi){
            for(var x=1;x<$(el).find("tr").length+1;x++){
                for(var z=1;z<$(el).children("tr").eq(0).children().length;z++){
                    var textt=$(el).children("tr").eq(x).children().eq(z);
                    textt.text(textt.text()+"%")
                }
            }
        }
        $scope.functable(".tBodyer",1,factiaojian,pingjun,tiaozhuan);
        suoxiao1()
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
                console.log(namearr)
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
                    console.log(namearr);
                    for(x of namearr){indexarr.push(namearr1.indexOf(x)+biaotou)};
                    console.log(indexarr)
                }
                for(let x=0;x<biaotou;x++){htmlx+=$(el).find("tr").eq(x).prop("outerHTML")}
                for(let x=0;x<indexarr.length;x++){htmlx+=$(el).find("tr").eq(indexarr[x]).prop("outerHTML")};
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
                            console.log(factiaojian);
                            pcBusinessFactory[factiaojian].metadata.pop();
                            pcBusinessFactory[factiaojian].metadata.push({
                                "jaql": {
                                    "table": "商业事业部业务指标",
                                    "column": "company",
                                    "dim": "[商业事业部业务指标.company]",
                                    "datatype": "text",
                                    "merged": true,
                                    "title": "company",
                                    "filter": {
                                        "explicit": true,
                                        "multiSelection": false,
                                        "members": [
                                            ""+$(objx).text()+""
                                        ]
                                    },
                                    "collapsed": false
                                },
                                "panel": "scope"
                            })
                            let arr=[];
                            if(pingjun){
                                [function(){
                                    for(let x=1;x<$(objx).parent().parent().children("td").length;x++){
                                        arr.push($(objx).parent().parent().children("td").eq(x).text())
                                    }
                                }()]
                            }
                            pingAnDataServices.getData(pcBusinessFactory[factiaojian], pcBusinessFactory.address).then(function(data) {
                                let lasttable=$(".tBodyer:first tr").clone(true);
                                $(".table_back").css("display","none");
                                $scope.func(data.headers, data.values, ".tBodyer:first", 1,null,pingjun,1);
                                $(".table_back").css("display","inline").click(function(){
                                    $(".tBodyer:first").empty().append(lasttable);
                                    $(".table_back").css("display","none")
                                })
                                if(pingjun){
                                    [function(){
                                        for(let x=1;x<$(el).find("tr:last td").length;x++){
                                            $(el).find("tr:last td").eq(x).text(arr[x-1])
                                        }
                                    }()]
                                }
                            });
                        })
                    }
                })
            })
        })
    }

    pingAnDataServices.getData(pcBusinessFactory.xinzengsuoding, pcBusinessFactory.address).then(function(data) {
        //console.log(data);
        $scope.suoding1 = data.values[0].data.toFixed(2);
        $scope.suoding2 = data.values[1].data.toFixed(2);
        $scope.suoding = $scope.zhibiaoNaN((($scope.suoding1 * 1 + $scope.suoding2 * 1) ).toFixed(2));
        //console.log($scope.suoding);
        $scope.$broadcast('to-child', data);

    });
    pingAnDataServices.getData(pcBusinessFactory.xinzengtouzi, pcBusinessFactory.address).then(function(data) {
        //	 console.log(data)
        $scope.touzifeixianzi = data.values[1].data * 1;
        $scope.touzixianzi = data.values[0].data * 1;
        $scope.touzi = $scope.zhibiaoNaN((($scope.touzixianzi + $scope.touzifeixianzi)).toFixed(2));
        $scope.$broadcast('to-child1', data);
        //		 console.log($scope.touzifeixianzi+$scope.touzixianzi);

    });
    pingAnDataServices.getData(pcBusinessFactory.zichanchihuibao, pcBusinessFactory.address).then(function(data) {
        //   console.log(data.values);
        $scope.zichanchi = $scope.zhibiaoNaN(((data.values[0].data) * 100).toFixed(2));

    });
    pingAnDataServices.getData(pcBusinessFactory.tongbizengzhang, pcBusinessFactory.address).then(function(data) {
        //console.log(data.values);
        $scope.tongbi = ((data.values[0].data) * 100).toFixed(2);

    });
    pingAnDataServices.getData(pcBusinessFactory.yusuandachenglv, pcBusinessFactory.address).then(function(data) {
        //console.log(data);

        isNaN(((data.values[0].data) * 100).toFixed(2))?$("#lirun").text("—"): $scope.yusuandacheng = ((data.values[0].data) * 100).toFixed(2);

    })
    pingAnDataServices.getData(pcBusinessFactory.zaijianxiangmushu, pcBusinessFactory.address).then(function(data) {
        //      console.log(data.values);
        $scope.zaijianxiangmu = $scope.zhibiaoNaN(data.values[0].data);
    })
    pingAnDataServices.getData(pcBusinessFactory.xinzengshitou, pcBusinessFactory.address).then(function(data) {
        //      console.log(data.values);
        $scope.xinzengshitou = $scope.zhibiaoNaN(data.values[0].data.toFixed(2));
    })
    pingAnDataServices.getData(pcBusinessFactory.leijishitou, pcBusinessFactory.address).then(function(data) {
        //      console.log(data.values);
        $scope.leijishitou = $scope.zhibiaoNaN(data.values[0].data.toFixed(2));
    })
    pingAnDataServices.getData(pcBusinessFactory.xiangmugeshu, pcBusinessFactory.address).then(function(data) {
        //      console.log(data.values);
        $scope.xiangmugeshu = $scope.zhibiaoNaN(data.values[0].data*1+data.values[1].data*1);
        $scope.$broadcast('to-child5', data);
    })
    pingAnDataServices.getData(pcBusinessFactory.ebitda, pcBusinessFactory.address).then(function(data) {
        //     console.log(data.values);
        isNaN(((data.values[0].data*1+data.values[1].data*1) * 100).toFixed(2))?$("#yitouzi2").text("—"): $scope.ebitda = ((data.values[0].data*1+data.values[1].data*1) * 100).toFixed(2);
        $scope.ebitda = ((data.values[0].data*1+data.values[1].data*1) * 100).toFixed(2);
        $scope.$broadcast('to-child3', data);
    })
    pingAnDataServices.getData(pcBusinessFactory.guanliguimo, pcBusinessFactory.address).then(function(data) {
        //      console.log(data.values);
        $scope.guanliguimo = $scope.zhibiaoNaN((data.values[0].data*1+data.values[1].data*1).toFixed(2));
        $scope.$broadcast('to-child4', data);
    })
    pingAnDataServices.getData(pcBusinessFactory.guanli, pcBusinessFactory.address).then(function(data) {
        // console.log(data.values);
        $scope.guanli1 = data.values[1].data * 1;
        $scope.guanli2 = data.values[0].data * 1;
        $scope.guanli = $scope.zhibiaoNaN((($scope.guanli1 + $scope.guanli2)).toFixed(2));
        $scope.$broadcast('to-child2', data);

    })
    pingAnDataServices.getData(pcBusinessFactory.xinzengsuodingtable, pcBusinessFactory.address).then(function(data) {
        //   	console.log(data);
        $scope.func(data.headers, data.values, ".tBodyer:first", 1,"xinzengsuodingx");
        $scope.$broadcast('to-child0', data);

    })

    // 商业投资，投资，资管的切换事件
    $scope.contentChanges = false;
    $scope.contentChanges1 = true;
    $scope.contentChanges2 = true;
    // $scope.normChanges=false;
    // $scope.normChanges1=true;
    $scope.firstLi = function() {
        $("#touzi").show();
        $("#ziguan").hide();
        $(".contentLeft p").text('年度新增锁定(亿元)');
        $(".contentRight p").text('年度新增锁定(亿元)');
        $scope.contentChanges = false;
        $scope.contentChanges1 = true;
        $scope.contentChanges2 = true;
        $("#right1").addClass("liActive").siblings().removeClass("liActive");
        // $("#zhutu").height(200);
        // $scope.$root.zhutuheight=180;
        $scope.xianshi=true;
        pingAnDataServices.getData(pcBusinessFactory.xinzengsuodingtable, pcBusinessFactory.address).then(function(data) {
            //   	console.log(data);
            $scope.func(data.headers, data.values, ".tBodyer:first", 1,"xinzengsuodingx",1);
            $scope.$broadcast('to-child0', data);

        })
        $(".liBottom").removeClass("liBottomActive");
        $("#suoding").addClass("liBottomActive");
        $(".table_back").css("display","none")
    };
    $scope.secondLi = function() {
        $("#touzi").show();
        $("#ziguan").hide();
        $(".contentLeft p").text('在建项目数');
        $(".contentRight p").text('在建项目数');
        $scope.contentChanges = true;
        $scope.contentChanges1 = false;
        $scope.contentChanges2 = true;
        $("#right2").addClass("liActive").siblings().removeClass("liActive");
        // $("#zhutu").height(300);
        // $scope.$root.zhutuheight=280;
        pingAnDataServices.getData(pcBusinessFactory.zaijianxiangmushutable, pcBusinessFactory.address).then(function(data) {
            //      	console.log(data);
            $scope.func(data.headers, data.values, ".tBodyer:first", 1,"zaijianxiangmushux");
            $scope.$broadcast('to-child0', data,1);

        })

        $scope.xianshi=true;
        $(".liBottom").removeClass("liBottomActive");
        $("#xiangmushu").addClass("liBottomActive");
        $(".table_back").css("display","none")
    };

    $scope.thirdLi = function() {
        $scope.tiaozhuanleixing=7;
        $("#touzi").hide();
        $("#ziguan").show();
        $(".contentLeft p").text('EBITDA YIELD');
        $(".contentRight p").text('EBITDA YIELD');
        $scope.contentChanges = true;
        $scope.contentChanges1 = true;
        $scope.contentChanges2 = false;
        $("#right3").addClass("liActive").siblings().removeClass("liActive");
        // $("#zhutu").height(455);
        // $scope.$root.zhutuheight=435;
        pingAnDataServices.getData(pcBusinessFactory.ebitdatable, pcBusinessFactory.address).then(function(data) {
            for(var i=0;i<data.values.length;i++){
                data.values[i][1].data=(data.values[i][1].data) * 100
                //data.values[i][2].data=(data.values[i][1].data) * 100
                //data.values[i][3].data=(data.values[i][1].data) * 100
            }
//					console.log(data)
            $scope.func(data.headers, data.values, ".tBodyer:first", 1,"ebitdax",[],null,"百分比");
            $scope.$broadcast('to-child0', data,0,true);
            huidiao();
        })
        function huidiao(){
            $(".tBodyer:first tr:last td").eq(1).text(typeof $scope.ebitda=="undefined"?"0%":$scope.ebitda+"%");
            $(".tBodyer:first tr:last td").eq(2).text(typeof $scope.yusuandacheng=="undefined"?"0%":$scope.yusuandacheng+"%");
            $(".tBodyer:first tr:last td").eq(3).text(typeof $scope.tongbi=="undefined"?"0%":$scope.tongbi+"%");
            for(let x=2;x<$(".tBodyer:first").children("tr").eq(0).children().length;x++){
                let text=$(".tBodyer:first").children("tr").eq(0).children()
                text.eq(x).text(text.eq(x).text().split("EBITDA YIELD")[1])
            }
            //$(".tBodyer:first tr:last td").eq(2).text(0)
            /*for(let x=1;x<$(".tBodyer:first tr").length;x++){
                $(".tBodyer:first tr").eq(x).children().eq(1).text($(".tBodyer:first tr").eq(x).children().eq(1).text()+"%")
                $(".tBodyer:first tr").eq(x).children().eq(2).text($(".tBodyer:first tr").eq(x).children().eq(2).text()+"%")
                $(".tBodyer:first tr").eq(x).children().eq(3).text($(".tBodyer:first tr").eq(x).children().eq(3).text()+"%")
            }*/
        }
        $scope.xianshi=true;
        $(".liBottom").removeClass("liBottomActive");
        $("#ebitdayield").addClass("liBottomActive");
        $(".table_back").css("display","none")
    };
    $scope.fouthLi = function() {
        // $scope.normChanges=true;
        // $scope.normChanges1=false;
        $(".fouthLi").addClass("liActive").siblings().removeClass("liActive");
    };
    // 柱图高度
    $scope.$root.zhutuheight=180;

    $(".liBottom").each(function(index, ele) {
        $(ele).click(function() {
            $(".liBottom").removeClass("liBottomActive");
            $(this).addClass("liBottomActive");
            $(".contentLeft p").text($(".pWord").eq(index).text());
            $(".contentRight p").text($(".pWord").eq(index).text());
            $(".table_back").css("display","none")
            if(index == 0) {
                $scope.tiaozhuanleixing=0;

                // $("#zhutu").height(200);
                // $scope.$root.zhutuheight=180;
                $scope.xianshi=true;
                pingAnDataServices.getData(pcBusinessFactory.xinzengsuodingtable, pcBusinessFactory.address).then(function(data) {
                    //   	console.log(data);
                    $scope.func(data.headers, data.values, ".tBodyer:first", 1,"xinzengsuodingx",1);

                    $scope.$broadcast('to-child0', data);

                })

            }
            if(index == 1) {
                $scope.tiaozhuanleixing=1;

                // $("#zhutu").height(300);
                // $scope.$root.zhutuheight=280;

                pingAnDataServices.getData(pcBusinessFactory.xinzengtouzitable, pcBusinessFactory.address).then(function(data) {
                    //     	console.log(data);
                    $scope.func(data.headers, data.values, ".tBodyer:first", 1,"xinzengtouzix");

                    $scope.$broadcast('to-child0', data);

                })
                // console.log($scope.$root.zhutuheight)
                // 左下柱图切换，两个柱子和一个柱子
                $scope.xianshi=true;
            }
            if(index == 2) {
                $scope.tiaozhuanleixing=2;

                // $("#zhutu").height(455);
                // $scope.$root.zhutuheight=415;
                pingAnDataServices.getData(pcBusinessFactory.zichanchi_dachenglv, pcBusinessFactory.address).then(function(data) {
                    console.log(data);
                    for(var i=0;i<data.values.length;i++){
                        data.values[i][1].data=(data.values[i][1].data) * 100;
                        data.values[i][2].data=(data.values[i][2].data) * 100;
                        data.values[i][3].data=(data.values[i][3].data) * 100
                    }
                    $scope.func(data.headers, data.values, ".tBodyer:first", 1,"zichanchi_dachenglv_xiangmu",[],null,"数据要百分比符号");
                    $scope.$broadcast('to-child0', data,0,true);
                    huidiao();
                })
                function huidiao(){
                    $(".tBodyer:first").find("tr:last td").eq(1).text($scope.zichanchi+"%");
                    $(".tBodyer:first").find("tr:last td").eq(3).text($scope.tongbi+"%");
                    /*for(let x=1;x<$(".tBodyer:first tr").length;x++){
                        $(".tBodyer:first tr").eq(x).children().eq(1).text($(".tBodyer:first tr").eq(x).children().eq(1).text()+"%")
                        $(".tBodyer:first tr").eq(x).children().eq(2).text($(".tBodyer:first tr").eq(x).children().eq(2).text()+"%")
                        $(".tBodyer:first tr").eq(x).children().eq(3).text($(".tBodyer:first tr").eq(x).children().eq(3).text()+"%")
                    }*/
                }

                // 左下柱图切换，两个柱子和一个柱子
                $scope.xianshi=true;

            }
            if(index == 3) {
                $scope.tiaozhuanleixing=3;

                pingAnDataServices.getData(pcBusinessFactory.guanlitable, pcBusinessFactory.address).then(function(data) {
                    // console.log(data);
                    $scope.func(data.headers, data.values, ".tBodyer:first", 1,"guanlix");
                    $scope.$broadcast('to-child9', data);

                })
                $scope.xianshi=false;
            }
            if(index == 4) {
                $scope.tiaozhuanleixing=4;

                $scope.xianshi=true;
                // $("#zhutu").height(300);
                // $scope.$root.zhutuheight=280;
                pingAnDataServices.getData(pcBusinessFactory.zaijianxiangmushutable, pcBusinessFactory.address).then(function(data) {
                    //      	console.log(data);
                    $scope.func(data.headers, data.values, ".tBodyer:first", 1,"zaijianxiangmushux");
                    $scope.$broadcast('to-child0', data,1);
                    // zidiaoyong1();
                })

            }
            if(index == 5) {
                $scope.tiaozhuanleixing=5;
                //
                // $("#zhutu").height(300);
                // $scope.$root.zhutuheight=280;
                pingAnDataServices.getData(pcBusinessFactory.xinzengshitoutable, pcBusinessFactory.address).then(function(data) {
                    //     	console.log(data);
                    $scope.func(data.headers, data.values, ".tBodyer:first", 1,"xinzengshitoux");
                    $scope.$broadcast('to-child0', data);

                })
                $scope.xianshi=true;
            }
            if(index == 6) {
                $scope.tiaozhuanleixing=6;

                // $("#zhutu").height(300);
                // $scope.$root.zhutuheight=280;
                pingAnDataServices.getData(pcBusinessFactory.leijishitoutable, pcBusinessFactory.address).then(function(data) {
                    //        	console.log(data);
                    $scope.func(data.headers, data.values, ".tBodyer:first", 1,"leijishitoux");
                    $scope.$broadcast('to-child0', data);

                })
                $scope.xianshi=true;
            }
            if(index == 7) {
                $scope.tiaozhuanleixing=7;

                // $("#zhutu").height(455);
                // $scope.$root.zhutuheight=435;
                pingAnDataServices.getData(pcBusinessFactory.ebitdatable, pcBusinessFactory.address).then(function(data) {
                    console.log(data)
                    for(var i=0;i<data.values.length;i++){
                        data.values[i][1].data=(data.values[i][1].data) * 100
                        //data.values[i][2].data=(data.values[i][1].data) * 100
                        //data.values[i][3].data=(data.values[i][1].data) * 100
                    }
//					console.log(data)
                    $scope.func(data.headers, data.values, ".tBodyer:first", 1,"ebitdax",true,null,"baifenbi");
                    $scope.$broadcast('to-child0', data,0,true);
                    huidiao();
                })
                function huidiao(){
                    $(".tBodyer:first tr:last td").eq(1).text(typeof $scope.ebitda=="undefined"?"0%":$scope.ebitda+"%");
                    $(".tBodyer:first tr:last td").eq(2).text(typeof $scope.yusuandacheng=="undefined"?"0%":$scope.yusuandacheng+"%");
                    $(".tBodyer:first tr:last td").eq(3).text(typeof $scope.tongbi=="undefined"?"0%":$scope.tongbi+"%");
                    for(let x=2;x<$(".tBodyer:first").children("tr").eq(0).children().length;x++){
                        let text=$(".tBodyer:first").children("tr").eq(0).children()
                        text.eq(x).text(text.eq(x).text().split("EBITDA YIELD")[1])
                    }
                    //$(".tBodyer:first tr:last td").eq(2).text(0)
                   /* for(let x=1;x<$(".tBodyer:first tr").length;x++){
                        $(".tBodyer:first tr").eq(x).children().eq(1).text($(".tBodyer:first tr").eq(x).children().eq(1).text()+"%")
                        $(".tBodyer:first tr").eq(x).children().eq(2).text($(".tBodyer:first tr").eq(x).children().eq(2).text()+"%")
                        $(".tBodyer:first tr").eq(x).children().eq(3).text($(".tBodyer:first tr").eq(x).children().eq(3).text()+"%")
                    }*/
                }
                $scope.xianshi=true;
            }
            if(index == 8) {
                $scope.tiaozhuanleixing=8;

                $scope.xianshi=false;
                pingAnDataServices.getData(pcBusinessFactory.guanliguimotable, pcBusinessFactory.address).then(function(data) {
                    //     	console.log(data);
                    $scope.func(data.headers, data.values, ".tBodyer:first", 1,"guanliguimox");
                    // 传data给controllerz柱图
                    $scope.$broadcast('to-child9', data);
                    huidiao()

                })
                function huidiao(){
                    // $(".xiangxi").unbind();
                    $(".xiangxi").each(function(indexx,objx){
                        $(objx).click(function(){
                            pcBusinessFactory[factiaojian].metadata.pop();
                            pcBusinessFactory[factiaojian].metadata.push({
                                "jaql": {
                                    "table": "商业事业部业务指标",
                                    "column": "company",
                                    "dim": "[商业事业部业务指标.company]",
                                    "datatype": "text",
                                    "merged": true,
                                    "title": "company",
                                    "filter": {
                                        "explicit": true,
                                        "multiSelection": false,
                                        "members": [
                                            ""+$(objx).text()+""
                                        ]
                                    },
                                    "collapsed": false
                                },
                                "panel": "scope"
                            })
                            let arr=[];
                            if(pingjun){
                                [function(){
                                    for(let x=1;x<$(objx).parent().parent().children("td").length;x++){
                                        arr.push($(objx).parent().parent().children("td").eq(x).text())
                                    }
                                }()]
                            }
                            pingAnDataServices.getData(pcBusinessFactory[factiaojian], pcBusinessFactory.address).then(function(data) {
                                $scope.func(data.headers, data.values, ".tBodyer:first", 1);
                                if(pingjun){
                                    [function(){
                                        for(let x=1;x<$(el).find("tr:last td").length;x++){
                                            $(el).find("tr:last td").eq(x).text(arr[x-1])
                                        }
                                    }()]
                                }
                            });
                        })
                    })
                }

            }
            if(index == 9) {
                $scope.tiaozhuanleixing=9;

                $scope.xianshi=false;
                pingAnDataServices.getData(pcBusinessFactory.xiangmugeshutable, pcBusinessFactory.address).then(function(data) {
                    //      	console.log(data);
                    $scope.$broadcast('to-child9', data,1);
                    $scope.func(data.headers, data.values, ".tBodyer:first", 1,"xiangmugeshux");
                    // zidiaoyong()


                })
                // 项目个数小数点去除
                // function zidiaoyong(){
                //    $(".tBodyer:first tr").each(function(index,obj){
                //        //console.log(index);
                //        if(index==0){
                //             $(obj).children("td").eq(1).text($(obj).children("td").eq(1).text())
                //             $(obj).children("td").eq(2).text($(obj).children("td").eq(2).text())
                //         }else{
                //             $(obj).children("td").eq(1).text(parseInt($(obj).children("td").eq(1).text()))
                //             $(obj).children("td").eq(2).text(parseInt($(obj).children("td").eq(2).text()))
                //         }
                //     })
                // }

            }
        });
    });



}])
app.controller('echartColumnControllerB', ["$scope","$http", "pingAnDataServices", "pcBusinessFactory", "pingAnDataServices", "pcBusinessFactory", function($scope, $http, pingAnDataServices, pcBusinessFactory) {
    var worLdMapContainer = document.getElementById('containerB')

    var mapChart = echarts.init(worLdMapContainer);


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
                }
            ],
        },
        grid: {
            left: '',
            right: '20',
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
                // barCategoryGap : '10px',
                itemStyle: {
                    //通常情况下：
                    normal:{
                        //每个柱子的颜色即为colorList数组里的每一项，如果柱子数目多于colorList的长度，则柱子颜色循环使用该数组
                        color: function (params){
                            var colorList = ['#27B7E9','#27B7E9','#27B7E9','#27B7E9','#27B7E9','#27B7E9','#27B7E9','#27B7E9','#27B7E9'];
                            return colorList[params.dataIndex];
                        },
                        shadowBlur: 5,
                        shadowOffsetY: 5,
                        shadowColor: '#7D7DFF',
                        // color:'#27B7E9'
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

    $scope.$on('to-child0', function(event, data,geshu,baifenbi) {
        // 重构canvas高度
        // option.height=$scope.$root.zhutuheight;

        //console.log(event)
        var hengtiaodata = []
        var hengtiaodata1 = []
        var markPointdata = []
        for(var i = 0; i < data.values.length; i++) {
            if(isNaN(data.values[i][1].data)){
                data.values[i][1].data=0.00;
            }
            // 判断小数位数,让项目数是整数
            if(geshu==1){
                hengtiaodata.push(parseInt(data.values[i][1].data));
                hengtiaodata1.unshift(parseInt(data.values[i][1].data));
                markPointdata.push({
                    yAxis: data.values[i][0].data
                })
                option.series[0].label.normal.formatter="{c}";
            }else {
                if(baifenbi){
                    hengtiaodata.push(parseFloat(data.values[i][1].data).toFixed(2));
                    hengtiaodata1.unshift(parseFloat(data.values[i][1].data).toFixed(2));
                    markPointdata.push({
                        yAxis: data.values[i][0].data
                    });
                    option.series[0].label.normal.formatter="{c}%";
                }else{
                    hengtiaodata.push(parseFloat(data.values[i][1].data).toFixed(2));
                    hengtiaodata1.unshift(parseFloat(data.values[i][1].data).toFixed(2));
                    markPointdata.push({
                        yAxis: data.values[i][0].data
                    });
                    option.series[0].label.normal.formatter="{c}";
                }

            }

        }

        option.series[0].data = null; //横条数据排序完后赋值回echarts

        var hengtiao = hengtiaodata.sort(function(x, y) {
            return x - y;
        }) //横条数据排序



        option.series[0].data =  hengtiao;
        option.series[0].name =  data.headers[1];
        option.xAxis.max = (hengtiao[hengtiao.length - 1] * 1.3).toFixed(0);


        var yAxis = []; //将小点排序里的y轴名称提取称一个数组

        for(var j = 0; j < data.values.length; j++) {
            yAxis.unshift(markPointdata[j].yAxis)

        }

        option.yAxis.data = yAxis; //将名称数组赋值给Y轴

        //console.log(option.series);

        option.legend.data[0].name = data.headers[1]
        // option.legend.data[1].name= data.headers[2]
        option.series[0].name = data.headers[1]
        // option.series[1].name = data.headers[2]
        mapChart.setOption(option);

        // mapChart.on('click', function (params) {
        //     console.log(params.dataIndex);
        //     console.log($scope.tiaoxingdianji);
        //     var colorList;
        //      colorList = ['#27B7E9','#27B7E9','#27B7E9','#27B7E9','#27B7E9','#27B7E9','#27B7E9','#27B7E9','#27B7E9'];
        //     for(var i=0;i<9;i++){
        //         if(params.dataIndex==i){
        //             colorList[i]='red';
        //         }
        //     }
        //     option.series[0].itemStyle.normal.color=function (params) {
        //         return colorList[params.dataIndex];
        //     }
        //     mapChart.setOption(option);
        // });


        // window.onresize = function () {
        //     resizeWorldMapContainer();
        //     mapChart.resize();
        // };
    });

}]);


app.controller('echartColumnControllerZ', ["$scope", "$http", "pingAnDataServices", "pcBusinessFactory", "pingAnDataServices", "pcBusinessFactory", function($scope, $http, pingAnDataServices, pcBusinessFactory) {

    var mapChart = echarts.init(document.getElementById('containerZ'));


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
                    name:'写字楼',
                    icon: 'bar',
                },{
                    name:'商场',
                    icon: 'bar',                    // textStyle:{color:'red'}
                }
            ],
        },
        grid: {
            left: '',
            right: '20',
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
                name: '写字楼',
                type: 'bar',
                data: [
                    // 12, 7.25, 29.47, 101.22, 104.33, 130.27, 144.15, 193.81, 199.09, 201.93
                ],

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
            },
            {
                name: '商场',
                type: 'bar',
                data: [
                    // 12, 7.25, 29.47, 101.22, 104.33, 130.27, 144.15, 193.81, 199.09, 201.93
                ],

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
                        color:'red',
                        shadowBlur: 5,
                        shadowOffsetY: 4,
                        shadowColor: '#ff5151',
                    },
                    //鼠标悬停时：
                    emphasis: {
                        shadowBlur: 10,
                        shadowOffsetX: 0,
                        shadowColor: '#fff',
                        color:'red'
                    }
                },
            }

        ]
    };

    $scope.$on('to-child9', function(event, data,geshu) {

        var hengtiaodata = []
        var hengtiaodata1 = []
        var markPointdata = []
        for(var i = 0; i < data.values.length; i++) {
            if(isNaN(data.values[i][1].data)){
                data.values[i][1].data=0.00;
            }
            if(isNaN(data.values[i][2].data)){
                data.values[i][2].data=0.00;
            }
            if(geshu==1){
                hengtiaodata.push(parseInt(data.values[i][1].data));
                hengtiaodata1.unshift(parseInt(data.values[i][2].data));
                markPointdata.push({

                    yAxis: data.values[i][0].data
                })
            }else {
                hengtiaodata.push(parseFloat(data.values[i][1].data).toFixed(2));
                hengtiaodata1.unshift(parseFloat(data.values[i][2].data).toFixed(2));
                markPointdata.push({

                    yAxis: data.values[i][0].data
                })
            }

        }

        option.series[0].data = null; //横条数据排序完后赋值回echarts
        option.series[1].data = null;
        var hengtiao = hengtiaodata.sort(function(x, y) {
            return x - y;
        }) //横条数据排序


        option.series[0].data =  hengtiao;
        option.series[1].data =  hengtiaodata1;
        option.series[0].name =  data.headers[1];
        option.series[1].name =  data.headers[2];
        //console.log(hengtiao);
        // console.log(option.xAxis);
        option.xAxis.max = (hengtiao[hengtiao.length - 1] * 1.3).toFixed(0);


        var yAxis = []; //将小点排序里的y轴名称提取称一个数组

        for(var j = 0; j < data.values.length; j++) {
            yAxis.unshift(markPointdata[j].yAxis)

        }

        option.yAxis.data = yAxis; //将名称数组赋值给Y轴

        // console.log(option);
        // console.log(data);
        option.legend.data[0].name = data.headers[1]
        option.legend.data[1].name= data.headers[2]
        option.series[0].name = data.headers[1]
        option.series[1].name = data.headers[2]

        mapChart.setOption(option);
    });

}]);


app.controller('echartColumnControllerB1', ["$scope", function($scope) {
    $scope.$on('to-child', function(event, data) {
        var mapChart = echarts.init(document.getElementsByClassName('liBottomRight')[0]);

        var option1 = {
            // title : {
            //     text: '某站点用户访问来源',
            //     subtext: '纯属虚构',
            //     x:'center'
            // },
            tooltip: {
                trigger: 'item',
                formatter: "{b} : {c} ({d}%)"
            },
            color: ['#ED5304', '#3DCFE2'],
            legend: {
                // orient: 'vertical',
                bottom: '0',
                itemWidth: 8,
                itemHeight: 8,
                data: ['险资', '非险资'],

            },
            series: [{
                hoverAnimation: false,
                name: '访问来源',
                type: 'pie',
                radius: '70%',
                center: ['60%', '40%'],
                data: [{
                    value: data.values[0].data.toFixed(2),
                    name: '险资'
                },
                    {
                        value: data.values[1].data.toFixed(2),
                        name: '非险资'
                    },

                ],
                label: {
                    normal: {
                        show: true,
                        position: 'inside',
                        formatter: function(params) {
                            return params.percent.toFixed(0) + "%"
                        },
                        fontSize: 10,
                    },
                },
                labelLine: {
                    normal: {
                        show: false,
                        // length:3,
                        // length2:3,
                        // smooth:false,
                    }
                },
                itemStyle: {
                    emphasis: {
                        shadowBlur: 10,
                        shadowOffsetX: 0,
                        shadowColor: 'rgba(0, 0, 0, 0.5)'
                    }
                }
            }]
        };
        //		console.log(option1.series)
        mapChart.setOption(option1)
    })
}])

app.controller('echartColumnControllerB2', ["$scope", function($scope) {
    $scope.$on('to-child1', function(event, data1) {
        var mapChart = echarts.init(document.getElementById('containerB1'));
        //  var mapChart1 = echarts.init(document.getElementById('containerB5'));
        var option1 = {
            // title : {
            //     text: '某站点用户访问来源',
            //     subtext: '纯属虚构',
            //     x:'center'
            // },
            tooltip: {
                trigger: 'item',
                formatter: "{b} : {c} ({d}%)"
            },
            color: ['#ED5304', '#3DCFE2'],
            legend: {
                // orient: 'vertical',
                bottom: '0',
                itemWidth: 8,
                itemHeight: 8,
                data: ['险资', '非险资'],

            },
            series: [{
                hoverAnimation: false,
                name: '访问来源',
                type: 'pie',
                radius: '70%',
                center: ['60%', '40%'],
                data: [{
                    value: 0,
                    name: '险资'
                },
                    {
                        value: 0,
                        name: '非险资'
                    },

                ],
                label: {
                    normal: {
                        show: true,
                        position: 'inside',
                        formatter: function(params) {
                            return params.percent.toFixed(0) + "%"
                        },
                        fontSize: 10,
                    },
                },
                labelLine: {
                    normal: {
                        show: false,
                        // length:3,
                        // length2:3,
                        // smooth:false,
                    }
                },
                itemStyle: {
                    emphasis: {
                        shadowBlur: 10,
                        shadowOffsetX: 0,
                        shadowColor: 'rgba(0, 0, 0, 0.5)'
                    }
                }
            }]
        };
        if(data1.values[0].data == ''){
            data1.values[0].data = 0;
        }
        if(data1.values[1].data == ''){
            data1.values[1].data = 0;
        }
        option1.series[0].data[0]=(data1.values[0].data * 1).toFixed(2)
        option1.series[0].data[1]=(data1.values[1].data * 1).toFixed(2)
        mapChart.setOption(option1)
        //  mapChart1.setOption(option1)
    })
}])

app.controller('echartColumnControllerB3', ["$scope", function($scope) {
    $scope.$on('to-child2', function(event, data1) {
        var mapChart = echarts.init(document.getElementById('containerB5'));
        var option1 = {
            tooltip: {
                trigger: 'item',
                formatter: "{b} : {c} ({d}%)"
            },
            color: ['#ED5304', '#3DCFE2'],
            legend: {
                // orient: 'vertical',
                bottom: '0',
                itemWidth: 8,
                itemHeight: 8,
                data: ['在建', '运营'],

            },
            series: [{
                hoverAnimation: false,
                name: '访问来源',
                type: 'pie',
                radius: '70%',
                center: ['60%', '40%'],
                data: [{
                    value: (data1.values[0].data * 1).toFixed(2),
                    name: '在建'
                },
                    {
                        value: (data1.values[1].data * 1).toFixed(2),
                        name: '运营'
                    },

                ],
                label: {
                    normal: {
                        show: true,
                        position: 'inside',
                        formatter: function(params) {
                            return params.percent.toFixed(0) + "%"
                        },
                        fontSize: 10,
                    },
                },
                labelLine: {
                    normal: {
                        show: false,
                        // length:3,
                        // length2:3,
                        // smooth:false,
                    }
                },
                itemStyle: {
                    emphasis: {
                        shadowBlur: 10,
                        shadowOffsetX: 0,
                        shadowColor: 'rgba(0, 0, 0, 0.5)'
                    }
                }
            }]
        };
        mapChart.setOption(option1)
        //  mapChart1.setOption(option1)
    })
}])

app.controller('echartColumnControllerZ1', ["$scope", function($scope) {
    $scope.$on('to-child3', function(event, data1) {
        var mapChart = echarts.init(document.getElementById('containerZ1'));
        var option1 = {
            tooltip: {
                trigger: 'item',
                formatter: "{b} : {c} ({d}%)"
            },
            color: ['#3DCFE2', '#ED5304'],
            legend: {
                // orient: 'vertical',
                bottom: '0',
                itemWidth: 8,
                itemHeight: 8,
                data: ['写字楼', '商场'],

            },
            series: [{
                hoverAnimation: false,
                name: '访问来源',
                type: 'pie',
                radius: '70%',
                center: ['60%', '40%'],
                data: [{
                    value: (data1.values[0].data * 100).toFixed(2),
                    name: '写字楼'
                },
                    {
                        value: (data1.values[1].data * 100).toFixed(2),
                        name: '商场'
                    },

                ],
                label: {
                    normal: {
                        show: true,
                        position: 'inside',
                        formatter: function(params) {
                            return params.percent.toFixed(0) + "%"
                        },
                        fontSize: 10,
                    },
                },
                labelLine: {
                    normal: {
                        show: false,
                        // length:3,
                        // length2:3,
                        // smooth:false,
                    }
                },
                itemStyle: {
                    emphasis: {
                        shadowBlur: 10,
                        shadowOffsetX: 0,
                        shadowColor: 'rgba(0, 0, 0, 0.5)'
                    }
                }
            }]
        };
        mapChart.setOption(option1)
    })
}])
app.controller('echartColumnControllerZ2', ["$scope", function($scope) {
    $scope.$on('to-child4', function(event, data1) {
        var mapChart = echarts.init(document.getElementById('containerZ2'));
        var option1 = {
            tooltip: {
                trigger: 'item',
                formatter: "{b} : {c} ({d}%)"
            },
            color: ['#3DCFE2', '#ED5304'],
            legend: {
                // orient: 'vertical',
                bottom: '0',
                itemWidth: 8,
                itemHeight: 8,
                data: ['写字楼', '商场'],

            },
            series: [{
                hoverAnimation: false,
                name: '访问来源',
                type: 'pie',
                radius: '70%',
                center: ['60%', '40%'],
                data: [{
                    value: (data1.values[0].data * 1).toFixed(2),
                    name: '写字楼'
                },
                    {
                        value: (data1.values[1].data * 1).toFixed(2),
                        name: '商场'
                    },

                ],
                label: {
                    normal: {
                        show: true,
                        position: 'inside',
                        formatter: function(params) {
                            return params.percent.toFixed(0) + "%"
                        },
                        fontSize: 10,
                    },
                },
                labelLine: {
                    normal: {
                        show: false,
                        // length:3,
                        // length2:3,
                        // smooth:false,
                    }
                },
                itemStyle: {
                    emphasis: {
                        shadowBlur: 10,
                        shadowOffsetX: 0,
                        shadowColor: 'rgba(0, 0, 0, 0.5)'
                    }
                }
            }]
        };
        mapChart.setOption(option1)
    })
}])
app.controller('echartColumnControllerZ3', ["$scope", function($scope) {
    $scope.$on('to-child5', function(event, data1) {
        var mapChart = echarts.init(document.getElementById('containerZ3'));
        var option1 = {
            tooltip: {
                trigger: 'item',
                formatter: "{b} : {c} ({d}%)"
            },
            color: ['#3DCFE2', '#ED5304'],
            legend: {
                // orient: 'vertical',
                bottom: '0',
                itemWidth: 8,
                itemHeight: 8,
                data: ['写字楼', '商场'],

            },
            series: [{
                hoverAnimation: false,
                name: '访问来源',
                type: 'pie',
                radius: '70%',
                center: ['60%', '40%'],
                data: [{
                    value: (data1.values[0].data * 1),
                    name: '写字楼'
                },
                    {
                        value: (data1.values[1].data * 1),
                        name: '商场'
                    },

                ],
                label: {
                    normal: {
                        show: true,
                        position: 'inside',
                        formatter: function(params) {
                            return params.percent.toFixed(0) + "%"
                        },
                        fontSize: 10,
                    },
                },
                labelLine: {
                    normal: {
                        show: false,
                        // length:3,
                        // length2:3,
                        // smooth:false,
                    }
                },
                itemStyle: {
                    emphasis: {
                        shadowBlur: 10,
                        shadowOffsetX: 0,
                        shadowColor: 'rgba(0, 0, 0, 0.5)'
                    }
                }
            }]
        };
        mapChart.setOption(option1)
    })
}])
//suo duan zui hou yi hang
function suoxiao1(){
    var wid = $('.tBodyer tr:eq(0)').width();
    $(".tBodyer tr:last").width(wid);
    // $(".tBodyer tr:first").width(wid);
}