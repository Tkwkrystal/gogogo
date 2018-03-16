/**
 * Created by Administrator on 2017/11/22.
 */
'use strict';
var app=angular.module('pingAn_PcNorm', ['pingAnServices','ngDialog','app.services']);
app.controller('pingAnNormController',['$scope',"$http","pingAnDataServices",'pcNormKPIFactory', 'tableHeaderHelper',function ($scope,$http,pingAnDataServices,pcNormKPIFactory,tableHeaderHelper) {
    $scope.xiaoshouhuikuane=0;
    /*pingAnDataServices.getData(pcNormKPIFactory.quanyihou_biaoge_xiaoshouhuikuan,pcNormKPIFactory.address).then(function(data){
        $scope.func(data.headers,data.values,".tBodyer:first",1,"quanyihou_biaoge_xiangmu_xiaoshouhuikuan");
        $scope.quanyihoujiequ(".tBodyer:first");
        $scope.xiaoshouhuikuane=$(".tBodyer:first tr:last td").eq(1).text()
    })*/
    pingAnDataServices.getData(pcNormKPIFactory.yitouziebiaoge,pcNormKPIFactory.address).then(function(data){
        $scope.func(data.headers,data.values,".tBodyer:first",1,"yutiyzuebiaogexiangxixiangmu")
        // $scope.functable(".tBodyer",1);
    })
    //跳转旧版
    $scope.tiaozhuan=function (projectName) {

        $scope.dashboards='/dashboards/58a6b2f7f7dcb5440400014a/';
        $scope.canshu='[{"jaql":{"table":"维度表_项目立项","column":"项目名称","dim":"[维度表_项目立项.项目名称]","datatype":"text","merged":true,"title":"项目名称","filter":{"members":["'+projectName+'"]}}}]';
        // $scope.canshu=encodeURI ($scope.canshu);
        //console.log($scope.canshu);
        // $scope.filter=$scope.dashboards.concat($scope.canshu);
        // console.log($scope.filter);
        $http.post('/api/funAuth/otherVision',{'username': $scope.user.userName,'dashboards':$scope.dashboards,'canshu':$scope.canshu}).then(function(response,status){
            //console.log(response);
            window.open(response.data,"_blank");
        })
        //console.log('/api/funAuth/otherVision');
    }

    $scope.fanhuijiuban=function(){
        $scope.dashboards='/dashboards/59e91a12dd0209442300050c/';
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



    $scope.func = function(header, body, el, hejix, factiaojian,tiaozhuan) {
        //参数解析 获取数据后的header表头，获取数据后的values表体，放哪里 一般按默认tbody，是否需要合计，点击区后里面的factory条件，详细项目跳转旧版判断
        let thead = "",
            bodyx = {},
            hejiz={},
            tbodyx = "",
            htmlx = "",
            heji = "",
            y=0;
        //外层循环表头
        for(let x = 0; x < header.length; x++) {
            header[x] = tableHeaderHelper.changeLine(header[x]);
            //默认排序后 第一个要加箭头
            if(x==0){
                if(header[x].indexOf("（")>=0){
                    thead += "<td>" + (header[x] === "N\\A" ? "" : header[x].substring(0,header[x].indexOf("（"))) + "<span class='jiantou glyphicon glyphicon-chevron-down' style='color:gray;opacity:.5;width:20px;height:20px'></span></td>";
                }else{
                    thead += "<td>" + (header[x] === "N\\A" ? "" : header[x]) + "<span class='jiantou glyphicon glyphicon-chevron-down' style='color:gray;opacity:.5;width:20px;height:20px'></span></td>";
                }
            }else{
                //有括号的话 截取到括号位置 N/A转换
                if(header[x].indexOf("（")>=0){
                    thead += "<td>" + (header[x] === "N\\A" ? "" : header[x].substring(0,header[x].indexOf("（"))) + "</td>";
                }else{
                    thead += "<td>" + (header[x] === "N\\A" ? "" : header[x]) + "</td>";
                }
            }


            hejiz['heji' + x]=0;
            //内层循环表体
            for(let z = 0; z < body.length; z++) {
                //是否为整数 整数不进行越位
                if(Number.isInteger(body[z][x].data)){
                    //不是数字就是汉字 第一列点击
                    if(isNaN(body[z][x].data)) {
                        bodyx['tbody' + z] += "<td><a style='text-decoration:none;cursor:pointer' class='xiangxi'>" + body[z][x].data + "</a></td>"
                    } else {
                        //因为有递归 所以try catch
                        try{
                            //拼接表体字符串
                            bodyx['tbody' + z] += "<td>" +body[z][x].data + "</td>";
                            //拼接合计
                            hejiz['heji' + x]+=body[z][x].data*1;
                        }catch(err){
                            bodyx['tbody' + z] += "<td>" +body[z][x].data + "</td>";
                            hejiz['heji' + x]+=body[z][x].data*1;
                        }
                    }

                }else{
                    if(isNaN(body[z][x].data)) {
                        bodyx['tbody' + z] += "<td><a style='text-decoration:none;cursor:pointer' class='xiangxi'>" + body[z][x].data + "</a></td>"
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
        //拼接表头 tr
        thead = "<tr>" + thead + "</tr>";
        //拼接表体 tr
        for(let z = 0; z < body.length; z++) {
            bodyx['tbody' + z] = "<tr>" + bodyx['tbody' + z] + "</tr>";
        }
        //表体相加
        for(let z = 0; z < body.length; z++) {
            tbodyx += bodyx['tbody' + z];
        }
        //合计拼接
        for(let z = 1; z < header.length; z++) {
            //整数不约位
            if(Number.isInteger(hejiz['heji' + z])){
                heji+="<td style='color:#27ADFE'>" + hejiz['heji' + z] + "</td>"
            }else {
                heji+="<td style='color:#27ADFE'>" + hejiz['heji' + z].toFixed(2) + "</td>"
            }

        }
        //合计拼接
        heji="<tr><td style='color:#27ADFE'>合计</td>"+heji+"</tr>";
        //判断最后一行是否超出个数，防止被合计覆盖
        if($('tr').length>11){
            tbodyx +="<tr></tr>"
        }else{
            tbodyx=tbodyx
        }
        //是否需要合计
        hejix ? tbodyx += heji : "";
        $(el).empty().append(thead + tbodyx);

        //左方点击功能
        $(".xiangxi").each(function(indexx,objx){
            //递归后又传参 会判断参数 （详细项目部分）
            if(tiaozhuan){
                $(objx).click(function(){
                    $scope.tiaozhuan($(objx).text())
                })
            }else {
                $(objx).click(function () {
                    //获取过来的metadata有筛选（最后一项） 需要删掉 并且重新push点击的筛选条件
                    pcNormKPIFactory[factiaojian].metadata.pop();
                    pcNormKPIFactory[factiaojian].metadata.push({
                        "jaql": {
                            "table": "商住合作业务指标",
                            "column": "城市分公司",
                            "dim": "[商住合作业务指标.城市分公司]",
                            "datatype": "text",
                            "merged": true,
                            "title": "城市分公司",
                            "filter": {
                                "explicit": true,
                                "multiSelection": false,
                                "members": ["" + $(objx).text() + ""]
                            },
                            "collapsed": false
                        },
                    });
                    pingAnDataServices.getData(pcNormKPIFactory[factiaojian], pcNormKPIFactory.address).then(function (data) {
                        function valx() {
                            let arr = [];
                            for (let x = 0; x < data.values.length; x++) {
                                arr.push(data.values[x].slice(0, data.values[0].length - 1))
                            }
                            return arr
                        };
                        $scope.func(data.headers.slice(0, data.headers.length - 1), valx(), ".tBodyer:first", 1,0,true);

                        //$scope.func(data.headers, data.values, ".tBodyer:first", 1);
                    });
                })
            }
        })
        //在表格生成后 优化格式
        $(el).find("tr").each(function(index,obj){
            y=0;
            //如果一行都为0 把这一行删了（以前测试数据需求）
            for(let x=1;x<$(obj).children("td").length;x++){
                if($(obj).children("td").eq(x).text()==="0.00"||$(obj).children("td").eq(x).text()==="-0.00"){
                    y++
                }
            }
            //N/A转化为—
            for(let x=0;x<$(obj).children("td").length;x++){
                if($(obj).children("td").eq(x).children().text()=="N\\A"){
                    $(obj).children("td").eq(x).children().text("—")
                }
            }
            //删除都为0的行
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
        //调用表格排序
        $scope.functable(".tBodyer",1,factiaojian,tiaozhuan);




        //因为需要默认第二列排序 所以将排序代码 复制进 参数改成具体的第二列

        //合计字符串
        let hejistring=$(el).find("tr").eq($(el).find("tr").length-1).prop("outerHTML");
        let hejistring1=$(el).find("tr").eq($(el).find("tr").length-2).prop("outerHTML");

        //删掉后排序
        $(el).find("tr").eq($(el).find("tr").length-1).remove();
        $(el).find("tr").eq($(el).find("tr").length-1).remove()

        //箭头方向
        //$scope.reversex[1]=!$scope.reversex[1];
        //删除箭头
        $(".jiantou").remove();
        //当前的 reversex为undefined 将箭头添加到 第二列的表头
        if($scope.reversex[1]){$(`<span class="jiantou glyphicon glyphicon-chevron-down" style="width:20px;height:20px;opacity".5></span>`).appendTo($(el).find("tr").eq(0).children().eq(1))}
        else{$(`<span class="jiantou glyphicon glyphicon-chevron-up" style="width:20px;height:20px;opacity:.5"></span>`).appendTo($(el).find("tr").eq(0).children().eq(1))}
        let namearr=[],indexarr=[],htmlxx="";
        //添加排序内容
        var z=0;
        if(isNaN($(el).find("tr").eq(1).children().eq(1).text())){
            if($(el).find("tr").eq(biaotou).children().eq(1).text()==="/"){
                for(var x=biaotou;x<$(el).find("tr").length;x++){
                    z++;
                    if($(el).find("tr").eq(x).children().eq(1).text()!=="/"){
                        namearr.push($(el).find("tr").eq(x).children().eq(1).text()*1+z/1000000)
                    }else{
                        namearr.push(0+z/1000000)
                    }
                }
            }else{
                for(var x=biaotou;x<$(el).find("tr").length;x++){
                    namearr.push($(el).find("tr").eq(x).children().eq(1).text())
                }
            }
            //namearr.push($(el).find("tr").eq(x).children().eq(index).text())
        }else{
            for(var x=1;x<$(el).find("tr").length;x++){
                z++;
                if($(el).find("tr").eq(x).children().eq(1).text()!=="/"){
                    namearr.push($(el).find("tr").eq(x).children().eq(1).text()*1+z/1000000)
                }else{
                    namearr.push(0+z/1000000)
                }
                //namearr.push($(el).find("tr").eq(x).children().eq(index).text()*1+z/1000000);
            }
        }
        //不是数字排序
        if(isNaN($(el).find("tr").eq(1).children().eq(1).text())){
            indexarr=[];let namearr1=[];
            for(x of namearr){namearr1.push(x)}
            if($scope.reversex[1]){namearr.sort();}else{namearr.sort().reverse();}
            for(x of namearr){indexarr.push(namearr1.indexOf(x)+biaotou)};
            //数字排序
        }else{
            indexarr=[];let namearr1=[];
            for(x of namearr){namearr1.push(x)}
            if($scope.reversex[1]){namearr.sort((x,x1)=>x-x1);}else{namearr.sort((x,x1)=>x-x1).reverse();}
            for(x of namearr){indexarr.push(namearr1.indexOf(x)+1)};
        }
        for(let x=0;x<1;x++){htmlxx+=$(el).find("tr").eq(x).prop("outerHTML")}
        for(let x=0;x<indexarr.length;x++){htmlxx+=$(el).find("tr").eq(indexarr[x]).prop("outerHTML")};
        htmlxx+=hejistring1;
        htmlxx+=hejistring;
        $(el).empty().append(htmlxx);
        $scope.functable(el,1,factiaojian,tiaozhuan);
            $(".xiangxi").each(function(indexx,objx){
                if(tiaozhuan){
                    $(objx).click(function(){
                        $scope.tiaozhuan($(objx).text())
                    })
                }else{
                    $(objx).click(function(){
                        pcNormKPIFactory[factiaojian].metadata.pop();
                        pcNormKPIFactory[factiaojian].metadata.push({
                            "jaql": {
                                "table": "商住合作业务指标",
                                "column": "城市分公司",
                                "dim": "[商住合作业务指标.城市分公司]",
                                "datatype": "text",
                                "merged": true,
                                "title": "城市分公司",
                                "filter": {
                                    "explicit": true,
                                    "multiSelection": false,
                                    "members": [""+$(objx).text()+""]
                                },
                                "collapsed": false
                            },
                        });
                        pingAnDataServices.getData(pcNormKPIFactory[factiaojian], pcNormKPIFactory.address).then(function(data) {
                            function valx(){
                                let arr=[];
                                for(let x=0;x<data.values.length;x++){
                                    arr.push(data.values[x].slice(0,data.values[0].length-1))
                                }
                                return arr
                            }
                            let lasttable=$(".tBodyer:first tr").clone(true);
                            $(".table_back").css("display","none")
                            $scope.func(data.headers.slice(0,data.headers.length-1), valx(), ".tBodyer:first", 1,0,1);
                            //$scope.func(data.headers, data.values, ".tBodyer:first", 1);
                            $(".table_back").css("display","inline").click(function(){
                                $(".tBodyer:first").empty().append(lasttable);
                                $(".table_back").css("display","none")
                            })
                        });
                    })
                }
            });
            $(".tBodyer:first .chengshi").each(function(index,obj){
                $(obj).click(function(){
                    var abc=angular.copy($scope.chengshi);
                    abc.metadata.pop();
                    abc.metadata.push(
                        {
                            "jaql": {
                                "table": "商住合作业务指标",
                                "column": "FNAME_L2",
                                "dim": "[商住合作业务指标.FNAME_L2]",
                                "datatype": "text",
                                "merged": true,
                                "title": "FNAME_L2",
                                "filter": {
                                    "explicit": true,
                                    "multiSelection": false,
                                    "members": [
                                        ""+ $(obj).text()+""
                                    ]
                                },
                                "collapsed": false
                            },
                            "disabled": false,
                            "panel": "scope"
                        }
                    );
                    abc.metadata[0]={
                        "jaql": {
                            "table": "商住合作业务指标",
                            "column": "项目名称",
                            "dim": "[商住合作业务指标.项目名称]",
                            "datatype": "text",
                            "merged": true,
                            "title": "项目名称"
                        },
                        "format": {
                            "color": {
                                "type": "color",
                                "color": "transparent"
                            }
                        },
                        "field": {
                            "id": "[商住合作业务指标.项目名称]",
                            "index": 0
                        },
                        "panel": "rows"
                    },
                        pingAnDataServices.getData(abc,pcNormKPIFactory.address).then(function(data) {
                            $scope.func(data.headers,data.values,".tBodyer:first",1,0,1);
                            //huidiaox()
                        })
                    function huidiaox(){
                        for(let x=0;x<$(".tBodyer:first tr").length;x++){
                            $(".tBodyer:first tr").eq(x).children("td").eq($(".tBodyer:first tr").eq(x).children("td").length-1).remove();
                        }
                    }
                })
            })

        $scope.quanyiqianjiequ(el);
        $scope.quanyihoujiequ(el);
        suoxiao();

    }
    $scope.reversex={}
    $scope.functable=function(el,biaotou,factiaojian,tiaozhuanx){
        biaotou=biaotou||1;
        $(el).find("tr").eq(0).children().each(function(index,obj){
            $(obj).click(function(){
                let hejistring=$(el).find("tr").eq($(el).find("tr").length-1).prop("outerHTML");
                let hejistring1=$(el).find("tr").eq($(el).find("tr").length-2).prop("outerHTML");

                $(el).find("tr").eq($(el).find("tr").length-1).remove();
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
                    console.log(namearr);
                    for(x of namearr){indexarr.push(namearr1.indexOf(x)+biaotou)};
                    console.log(indexarr)
                }
                for(let x=0;x<biaotou;x++){htmlx+=$(el).find("tr").eq(x).prop("outerHTML")}
                for(let x=0;x<indexarr.length;x++){htmlx+=$(el).find("tr").eq(indexarr[x]).prop("outerHTML")};
                htmlx+=hejistring1;
                htmlx+=hejistring;
                $(el).empty().append(htmlx);
                $scope.functable(el,biaotou,factiaojian,tiaozhuanx);
                    $(".xiangxi").each(function(indexx,objx){
                        if(tiaozhuanx){
                            $(objx).click(function(){
                                $scope.tiaozhuan($(objx).text())
                            })
                        }else{
                            $(objx).click(function(){
                                pcNormKPIFactory[factiaojian].metadata.pop();
                                pcNormKPIFactory[factiaojian].metadata.push({
                                    "jaql": {
                                        "table": "商住合作业务指标",
                                        "column": "城市分公司",
                                        "dim": "[商住合作业务指标.城市分公司]",
                                        "datatype": "text",
                                        "merged": true,
                                        "title": "城市分公司",
                                        "filter": {
                                            "explicit": true,
                                            "multiSelection": false,
                                            "members": [""+$(objx).text()+""]
                                        },
                                        "collapsed": false
                                    },
                                });


                                pingAnDataServices.getData(pcNormKPIFactory[factiaojian], pcNormKPIFactory.address).then(function(data) {
                                    function valx(){
                                        let arr=[];
                                        for(let x=0;x<data.values.length;x++){
                                            arr.push(data.values[x].slice(0,data.values[0].length-1))
                                        }
                                        return arr
                                    }
                                    let lasttable=$(".tBodyer:first tr").clone(true);
                                    $(".table_back").css("display","none")
                                    $scope.func(data.headers.slice(0,data.headers.length-1), valx(), ".tBodyer:first", 1,null,1);
                                    //$scope.func(data.headers, data.values, ".tBodyer:first", 1);
                                    $(".table_back").css("display","inline").click(function(){
                                        $(".tBodyer:first").empty().append(lasttable);
                                        $(".table_back").css("display","none")
                                    })
                                });
                            })
                        }

                    });
                    $(".tBodyer:first .chengshi").each(function(index,obj){
                        $(obj).click(function(){
                            var abc=angular.copy($scope.chengshi);
                            abc.metadata.pop();
                            abc.metadata.push(
                                {
                                    "jaql": {
                                        "table": "商住合作业务指标",
                                        "column": "FNAME_L2",
                                        "dim": "[商住合作业务指标.FNAME_L2]",
                                        "datatype": "text",
                                        "merged": true,
                                        "title": "FNAME_L2",
                                        "filter": {
                                            "explicit": true,
                                            "multiSelection": false,
                                            "members": [
                                                ""+ $(obj).text()+""
                                            ]
                                        },
                                        "collapsed": false
                                    },
                                    "disabled": false,
                                    "panel": "scope"
                                }
                            );
                            abc.metadata[0]={
                                "jaql": {
                                    "table": "商住合作业务指标",
                                    "column": "项目名称",
                                    "dim": "[商住合作业务指标.项目名称]",
                                    "datatype": "text",
                                    "merged": true,
                                    "title": "项目名称"
                                },
                                "format": {
                                    "color": {
                                        "type": "color",
                                        "color": "transparent"
                                    }
                                },
                                "field": {
                                    "id": "[商住合作业务指标.项目名称]",
                                    "index": 0
                                },
                                "panel": "rows"
                            },
                                pingAnDataServices.getData(abc,pcNormKPIFactory.address).then(function(data) {
                                    $scope.func(data.headers,data.values,".tBodyer:first",1,null,1);
                                    //huidiaox()
                                })
                            function huidiaox(){
                                for(let x=0;x<$(".tBodyer:first tr").length;x++){
                                    $(".tBodyer:first tr").eq(x).children("td").eq($(".tBodyer:first tr").eq(x).children("td").length-1).remove();
                                }
                            }
                        })
                    })
            });
        })
    }

    $scope.fengongsi=null;
    $scope.chengshi=null;
    $scope.fengongsixiangxi=null;
    $scope.fengongsi1=null;
    $scope.chengshi1=null;
    $scope.fengongsixiangxi1=null;
    $scope.quanyi=false;
    $scope.quanyiyincang=true,

    // 城市的切换!
    $scope.circleHide=false;
    $scope.circleHide1=true;
    $scope.switch=function () {
        $(".table_back").css("display","none")
        $scope.circleHide=false;
        $scope.circleHide1=true;
    }
    $scope.switch1=function () {
        $(".table_back").css("display","none")
        $scope.circleHide=true;
        $scope.circleHide1=false;
    }

    // KPI和权益的切换事件
    $scope.contentChanges=false;
    $scope.contentChanges1=true;
    $scope.firstLi=function () {
        $scope.contentChanges=false;
        $scope.contentChanges1=true;
        $(".firstLi").addClass("liActive").siblings().removeClass("liActive");

        $(".contentLeft p").eq(0).text("权益已投资额(亿元)");
        $(".contentRight p").eq(0).text("权益已投资额(亿元)");
        $(".liBottom").removeClass("liBottomActive");
        $(".liBottom:first").addClass("liBottomActive")

        $scope.circleHide=false;
        $scope.circleHide1=true;
        $scope.quanyiyincang=true;
        $scope.quanyi=false;
        $scope.fengongsi=pcNormKPIFactory.yitouziebiaoge;
        $scope.fengongsixiangxi="yutiyzuebiaogexiangxixiangmu";

        $scope.chengshi=pcNormKPIFactory.yitouziebiaoge;

        $scope.chengshi=angular.copy($scope.chengshi);
        $scope.chengshi.metadata.push(
            { "jaql": {
                    "table": "商住合作业务指标",
                    "column": "FNAME_L2",
                    "dim": "[商住合作业务指标.FNAME_L2]",
                    "datatype": "text",
                    "merged": true,
                    "title": "城市"
                }}
        );
        //已投资额的条形图
        pingAnDataServices.getData(pcNormKPIFactory.yitouzietiaoxingtu,pcNormKPIFactory.address).then(function(data){
            $scope.$broadcast('to-childNorm', data);
            // $scope.pNumber=(data.values[0][0].data/10000).toFixed(2)


        })
        //已投资额表格
        pingAnDataServices.getData(pcNormKPIFactory.yitouziebiaoge,pcNormKPIFactory.address).then(function(data){
            console.log(data)
            $scope.func(data.headers,data.values,".tBodyer:first",1,"yutiyzuebiaogexiangxixiangmu")
            // $scope.functable(".tBodyer",1);
        })
    };
    $scope.secondLi=function () {
        $scope.contentChanges=true;
        $scope.contentChanges1=false;
        $(".secondLi").addClass("liActive").siblings().removeClass("liActive");


        $(".contentLeft p").eq(0).text("权益销售金额(亿元)");
        $(".contentRight p").eq(0).text("权益销售金额(亿元)");
        $(".liContent").removeClass("liContentActive");
        $(".liContent:first").addClass("liContentActive")
        $(".fouthLi").unbind();
        $(".thirdLi").unbind();
        $scope.circleHide=false;
        $scope.circleHide1=true;
        $scope.quanyiyincang=false;
        $scope.fengongsi=pcNormKPIFactory.quanyihou_biaoge;
        $scope.chengshi=pcNormKPIFactory.quanyihou_biaoge_chengshi;
        $scope.fengongsixiangxi="quanyihou_biaoge_xiangmu";
        $scope.chengshi=angular.copy($scope.chengshi);
        $scope.chengshi.metadata.push(
            { "jaql": {
                    "table": "商住合作业务指标",
                    "column": "FNAME_L2",
                    "dim": "[商住合作业务指标.FNAME_L2]",
                    "datatype": "text",
                    "merged": true,
                    "title": "城市"
                }}
        );
        $scope.quanyi=false;
        $(".fouthLi").addClass("liActive").siblings().removeClass("liActive");
        //权益销售金额条形图
        pingAnDataServices.getData(pcNormKPIFactory.quanyihou_tiaoxingtu,pcNormKPIFactory.address).then(function(data){
            $scope.$broadcast('to-childNorm', data);
            // $scope.pNumber=(data.values[0][0].data/10000).toFixed(2)
        })
        //权益销售金额表格
        pingAnDataServices.getData(pcNormKPIFactory.quanyihou_biaoge,pcNormKPIFactory.address).then(function(data){
            $scope.func(data.headers,data.values,".tBodyer:first",1,"quanyihou_biaoge_xiangmu");
            $scope.quanyihoujiequ(".tBodyer:first");
        })

        //点击权益前变化
        $(".thirdLi").click(function(){
            $(".thirdLi").addClass("liActive").siblings().removeClass("liActive");
            $scope.fengongsi1=pcNormKPIFactory.quanyiqian_biaoge;
            $scope.chengshi1=pcNormKPIFactory.quanyiqian_biaoge_chengshi;
            $scope.fengongsixiangxi1="quanyiqian_biaoge_xiangmu";
            $scope.chengshi1=angular.copy($scope.chengshi1);
            $scope.chengshi1.metadata.push(
                { "jaql": {
                        "table": "商住合作业务指标",
                        "column": "FNAME_L2",
                        "dim": "[商住合作业务指标.FNAME_L2]",
                        "datatype": "text",
                        "merged": true,
                        "title": "城市"
                    }}
            );
            $scope.quanyi=true;
            $scope.circleHide=false;
            $scope.circleHide1=true;
            //条形图
            pingAnDataServices.getData(pcNormKPIFactory.quanyiqian_tiaoxingtu,pcNormKPIFactory.address).then(function(data){
                $scope.$broadcast('to-childNorm', data);
                // $scope.pNumber=(data.values[0][0].data/10000).toFixed(2)
            })
            //表格
            pingAnDataServices.getData(pcNormKPIFactory.quanyiqian_biaoge,pcNormKPIFactory.address).then(function(data){
                console.log(data)
                $scope.func(data.headers,data.values,".tBodyer:first",1,"quanyiqian_biaoge_xiangmu");
                $scope.quanyiqianjiequ(".tBodyer:first");
            })
        })
        //点击权益后变化
        $(".fouthLi").click(function(){
            $(".fouthLi").addClass("liActive").siblings().removeClass("liActive");
            $scope.fengongsi=pcNormKPIFactory.quanyihou_biaoge;
            $scope.chengshi=pcNormKPIFactory.quanyihou_biaoge_chengshi;
            $scope.fengongsixiangxi="quanyihou_biaoge_xiangmu";
            $scope.chengshi=angular.copy($scope.chengshi);
            $scope.chengshi.metadata.push(
                { "jaql": {
                        "table": "商住合作业务指标",
                        "column": "FNAME_L2",
                        "dim": "[商住合作业务指标.FNAME_L2]",
                        "datatype": "text",
                        "merged": true,
                        "title": "城市"
                    }}
            );
            $scope.quanyi=false;
            $scope.circleHide=false;
            $scope.circleHide1=true;
            //条形图
            pingAnDataServices.getData(pcNormKPIFactory.quanyihou_tiaoxingtu,pcNormKPIFactory.address).then(function(data){
                $scope.$broadcast('to-childNorm', data);
                // $scope.pNumber=(data.values[0][0].data/10000).toFixed(2)
            })
            //表格
            pingAnDataServices.getData(pcNormKPIFactory.quanyihou_biaoge,pcNormKPIFactory.address).then(function(data){
                $scope.func(data.headers,data.values,".tBodyer:first",1,"quanyihou_biaoge_xiangmu");
                $scope.quanyihoujiequ(".tBodyer:first");
            })
        })

    };

    $scope.thirdLi=function () {
        $(".thirdLi").addClass("liActive").siblings().removeClass("liActive");
    };
    $scope.fouthLi=function () {
        $(".fouthLi").addClass("liActive").siblings().removeClass("liActive");
    };
    // KPI点击事件
    $(".liBottom").each(function (index,ele) {
        $(ele).click(function () {
            $(".liBottom").removeClass("liBottomActive");
            $(this).addClass("liBottomActive");
            $(".contentLeft p").text($(".pWord").eq(index).text());
            $(".contentRight p").text($(".pWord").eq(index).text());
        });
    });
    // 非KPI点击事件
    $(".liContent").each(function (index,ele) {
        $(ele).click(function () {
            $(".liContent").removeClass("liContentActive");
            $(this).addClass("liContentActive");
            $(".contentLeft p").text($(".pFirst").eq(index).text());
            $(".contentRight p").text($(".pFirst").eq(index).text());
        });
    });
    //已投资额点击事件
    $("#yitouzieli").click(function(){
        $scope.circleHide=false;
        $scope.circleHide1=true;
        $scope.quanyiyincang=true;
        $scope.quanyi=false;
        $scope.fengongsi=pcNormKPIFactory.yitouziebiaoge;
        $scope.fengongsixiangxi="yutiyzuebiaogexiangxixiangmu";

        $scope.chengshi=pcNormKPIFactory.yitouziebiaoge;

        $scope.chengshi=angular.copy($scope.chengshi);
        $scope.chengshi.metadata.push(
            { "jaql": {
                    "table": "商住合作业务指标",
                    "column": "FNAME_L2",
                    "dim": "[商住合作业务指标.FNAME_L2]",
                    "datatype": "text",
                    "merged": true,
                    "title": "城市"
                }}
        );
        //已投资额的条形图
        pingAnDataServices.getData(pcNormKPIFactory.yitouzietiaoxingtu,pcNormKPIFactory.address).then(function(data){
            $scope.$broadcast('to-childNorm', data);
            // $scope.pNumber=(data.values[0][0].data/10000).toFixed(2)


        })
        //已投资额表格
        pingAnDataServices.getData(pcNormKPIFactory.yitouziebiaoge,pcNormKPIFactory.address).then(function(data){
            $scope.func(data.headers,data.values,".tBodyer:first",1,"yutiyzuebiaogexiangxixiangmu")
            // $scope.functable(".tBodyer",1);
        })
        $(".table_back").css("display","none")
    });
    //平安销售回款
    $("#quanyixiaoshouhuikuan").click(function(){
        $scope.circleHide=false;
        $scope.circleHide1=true;
        $scope.quanyi=false;
        $scope.fengongsi=pcNormKPIFactory.pinganxiaoshouhuikuanbiaoge;
        $scope.fengongsixiangxi="pinganxiaoshouhuikuanxiangxixiangmu";
        $scope.quanyiyincang=true;
        $scope.chengshi=pcNormKPIFactory.pinganxiaoshouhuikuanbiaoge;
        $scope.chengshi=angular.copy($scope.chengshi);
        $scope.chengshi.metadata.push(
            { "jaql": {
                    "table": "商住合作业务指标",
                    "column": "FNAME_L2",
                    "dim": "[商住合作业务指标.FNAME_L2]",
                    "datatype": "text",
                    "merged": true,
                    "title": "城市"
                }}
        );
        //平安销售回款的条形图
        pingAnDataServices.getData(pcNormKPIFactory.pinganxiaoshouhuikuanzhutu,pcNormKPIFactory.address).then(function(data){
            $scope.$broadcast('to-childNorm', data);
            // $scope.pNumber=(data.values[0][0].data/10000).toFixed(2)
        })
        //平安销售回款表格
        pingAnDataServices.getData(pcNormKPIFactory.pinganxiaoshouhuikuanbiaoge,pcNormKPIFactory.address).then(function(data){
            $scope.func(data.headers,data.values,".tBodyer:first",1,"pinganxiaoshouhuikuanxiangxixiangmu")
        })
        $(".table_back").css("display","none")
    });
    //权益销售回款
    $("#quanyixiaoshouhuikuanli").click(function(){
        $(".fouthLi").unbind();
        $(".thirdLi").unbind();
        $scope.circleHide=false;
        $scope.circleHide1=true;
        $scope.quanyiyincang=false;
        $scope.fengongsi=pcNormKPIFactory.quanyihou_biaoge_xiaoshouhuikuan;
        $scope.fengongsixiangxi="quanyihou_biaoge_xiangmu_xiaoshouhuikuan";
        $scope.chengshi=pcNormKPIFactory.quanyihou_biaoge_chengshi_xiaoshouhuikuan;
        $scope.chengshi=angular.copy($scope.chengshi);
        $scope.chengshi.metadata.push(
            { "jaql": {
                    "table": "商住合作业务指标",
                    "column": "FNAME_L2",
                    "dim": "[商住合作业务指标.FNAME_L2]",
                    "datatype": "text",
                    "merged": true,
                    "title": "城市"
                }}
        );
        $scope.quanyi=false;
        $(".fouthLi").addClass("liActive").siblings().removeClass("liActive");
        //已开发面积条形图
        pingAnDataServices.getData(pcNormKPIFactory.quanyihou_tiaoxingtu_xiaoshouhuikuan,pcNormKPIFactory.address).then(function(data){
            $scope.$broadcast('to-childNorm', data);
            // $scope.pNumber=(data.values[0][0].data/10000).toFixed(2)
        })
        //已开发面积表格
        pingAnDataServices.getData(pcNormKPIFactory.quanyihou_biaoge_xiaoshouhuikuan,pcNormKPIFactory.address).then(function(data){
            $scope.func(data.headers,data.values,".tBodyer:first",1,"quanyihou_biaoge_xiangmu_xiaoshouhuikuan");
            $scope.quanyihoujiequ(".tBodyer:first")
        })
        $(".thirdLi").click(function(){
            $(".thirdLi").addClass("liActive").siblings().removeClass("liActive");
            $scope.fengongsi1=pcNormKPIFactory.quanyiqian_biaoge_xiaoshouhuikuan;
            $scope.chengshi1=pcNormKPIFactory.quanyiqian_biaoge_chengshi_xiaoshouhuikuan;
            $scope.fengongsixiangxi1="quanyiqian_biaoge_xiangmu_xiaoshouhuikuan";
            $scope.chengshi1=angular.copy($scope.chengshi1);
            $scope.chengshi1.metadata.push(
                { "jaql": {
                        "table": "商住合作业务指标",
                        "column": "FNAME_L2",
                        "dim": "[商住合作业务指标.FNAME_L2]",
                        "datatype": "text",
                        "merged": true,
                        "title": "城市"
                    }}
            );
            $scope.quanyi=true;
            $scope.circleHide=false;
            $scope.circleHide1=true;
            //条形图
            pingAnDataServices.getData(pcNormKPIFactory.quanyiqian_tiaoxingtu_xiaoshouhuikuan,pcNormKPIFactory.address).then(function(data){
                $scope.$broadcast('to-childNorm', data);
                // $scope.pNumber=(data.values[0][0].data/10000).toFixed(2)
            })
            //表格
            pingAnDataServices.getData(pcNormKPIFactory.quanyiqian_biaoge_xiaoshouhuikuan,pcNormKPIFactory.address).then(function(data){
                $scope.func(data.headers,data.values,".tBodyer:first",1,"quanyiqian_biaoge_xiangmu_xiaoshouhuikuan");
                $scope.quanyiqianjiequ(".tBodyer:first")
            })
        })
        //点击权益后变化
        $(".fouthLi").click(function(){
            $(".fouthLi").addClass("liActive").siblings().removeClass("liActive");
            $scope.fengongsi=pcNormKPIFactory.quanyihou_biaoge_xiaoshouhuikuan;
            $scope.chengshi=pcNormKPIFactory.quanyihou_biaoge_chengshi_xiaoshouhuikuan;
            $scope.fengongsixiangxi="quanyihou_biaoge_xiangmu_xiaoshouhuikuan";
            $scope.chengshi=angular.copy($scope.chengshi);
            $scope.chengshi.metadata.push(
                { "jaql": {
                        "table": "商住合作业务指标",
                        "column": "FNAME_L2",
                        "dim": "[商住合作业务指标.FNAME_L2]",
                        "datatype": "text",
                        "merged": true,
                        "title": "城市"
                    }}
            );
            $scope.quanyi=false;
            $scope.circleHide=false;
            $scope.circleHide1=true;
            //条形图
            pingAnDataServices.getData(pcNormKPIFactory.quanyihou_tiaoxingtu_xiaoshouhuikuan,pcNormKPIFactory.address).then(function(data){
                $scope.$broadcast('to-childNorm', data);
                // $scope.pNumber=(data.values[0][0].data/10000).toFixed(2)
            })
            //表格
            pingAnDataServices.getData(pcNormKPIFactory.quanyihou_biaoge_xiaoshouhuikuan,pcNormKPIFactory.address).then(function(data){
                $scope.func(data.headers,data.values,".tBodyer:first",1,"quanyihou_biaoge_xiangmu_xiaoshouhuikuan");
                $scope.quanyihoujiequ(".tBodyer:first")
            })
        })
    });
    //已实现利润
    $("#yishixianlirunli").click(function(){
        $scope.circleHide=false;
        $scope.circleHide1=true;
        $scope.quanyiyincang=true;
        $scope.quanyi=false;
        $scope.fengongsi=pcNormKPIFactory.yishixianlirunbiaoge;
        $scope.chengshi=pcNormKPIFactory.yishixianlirunbiaoge;
        $scope.fengongsixiangxi="yishixianlirunxiangxi";

        $scope.chengshi=angular.copy($scope.chengshi);
        $scope.chengshi.metadata.push(
            { "jaql": {
                    "table": "商住合作业务指标",
                    "column": "FNAME_L2",
                    "dim": "[商住合作业务指标.FNAME_L2]",
                    "datatype": "text",
                    "merged": true,
                    "title": "城市"
                }}
        );
        //条形图数据
        var arrtiaoxing=[]
        //已实现利润表格
        pingAnDataServices.getData(pcNormKPIFactory.yishixianlirunbiaoge,pcNormKPIFactory.address).then(function(data){
            $scope.func(data.headers,data.values,".tBodyer:first",1,"yishixianlirunxiangxi");
            //huidiao();
            //第一列数据等于后两列之和
            function huidiao(){
                for(var x=1;x<$(".tBodyer tr").length;x++){
                    for(var z=1;z<$(".tBodyer tr:first td").length;z++){
                        var textx=$(".tBodyer tr").eq(x).children("td").eq(z+1).text()*1+$(".tBodyer tr").eq(x).children("td").eq(z+2).text()*1
                        arrtiaoxing.push(textx);
                        $(".tBodyer tr").eq(x).children("td").eq(z).text(textx)
                    }
                }
                $scope.pNumber4=$(".tBodyer tr:last td").eq(1).text();
            }
        })
        //已实现利润条形图
        pingAnDataServices.getData(pcNormKPIFactory.yishixianlirunzhutu,pcNormKPIFactory.address).then(function(data){
            // for(var x=0;x<data.values.length;x++){
            //     data.values[x][1].data=arrtiaoxing[x]
            // }
            console.log(data);
            $scope.$broadcast('to-childNorm', data);
            // $scope.pNumber=(data.values[0][0].data/10000).toFixed(2)
        });
        $(".table_back").css("display","none")
    });

    //已开发面积
    $("#yikaifamianjili").click(function(){
        $(".fouthLi").unbind();
        $(".thirdLi").unbind();
        $scope.circleHide=false;
        $scope.circleHide1=true;
        $scope.quanyiyincang=false;
        $scope.fengongsi=pcNormKPIFactory.quanyiqian_biaoge_kaifamianji;
        $scope.fengongsixiangxi="quanyiqian_biaoge_xiangmu_kaifamianji";
        $scope.chengshi=pcNormKPIFactory.quanyiqian_biaoge_chengshi_kaifamianji;
        $scope.chengshi=angular.copy($scope.chengshi);
        $scope.chengshi.metadata.push(
            { "jaql": {
                    "table": "商住合作业务指标",
                    "column": "FNAME_L2",
                    "dim": "[商住合作业务指标.FNAME_L2]",
                    "datatype": "text",
                    "merged": true,
                    "title": "城市"
                }}
        );
        $scope.quanyi=false;
        $(".thirdLi").addClass("liActive").siblings().removeClass("liActive");
        //已开发面积条形图
        pingAnDataServices.getData(pcNormKPIFactory.quanyiqian_tiaoxingtu_kaifamianji,pcNormKPIFactory.address).then(function(data){
            $scope.$broadcast('to-childNorm', data);
            // $scope.pNumber=(data.values[0][0].data/10000).toFixed(2)
        })
        //已开发面积表格
        pingAnDataServices.getData(pcNormKPIFactory.quanyiqian_biaoge_kaifamianji,pcNormKPIFactory.address).then(function(data){
            $scope.func(data.headers,data.values,".tBodyer:first",1,"quanyiqian_biaoge_xiangmu_kaifamianji");
            $scope.quanyiqianjiequ(".tBodyer:first")
        });
        $(".table_back").css("display","none")
        $(".thirdLi").click(function(){
            $(".thirdLi").addClass("liActive").siblings().removeClass("liActive");
            $scope.fengongsi1=pcNormKPIFactory.quanyiqian_biaoge_kaifamianji;
            $scope.chengshi1=pcNormKPIFactory.quanyiqian_biaoge_chengshi_kaifamianji;
            $scope.fengongsixiangxi1="quanyiqian_biaoge_xiangmu_kaifamianji";
            $scope.chengshi1=angular.copy($scope.chengshi1);
            $scope.chengshi1.metadata.push(
                { "jaql": {
                        "table": "商住合作业务指标",
                        "column": "FNAME_L2",
                        "dim": "[商住合作业务指标.FNAME_L2]",
                        "datatype": "text",
                        "merged": true,
                        "title": "城市"
                    }}
            );
            $scope.quanyi=true;
            $scope.circleHide=false;
            $scope.circleHide1=true;
            //条形图
            pingAnDataServices.getData(pcNormKPIFactory.quanyiqian_tiaoxingtu_kaifamianji,pcNormKPIFactory.address).then(function(data){
                $scope.$broadcast('to-childNorm', data);
                // $scope.pNumber=(data.values[0][0].data/10000).toFixed(2)
            })
            //表格
            pingAnDataServices.getData(pcNormKPIFactory.quanyiqian_biaoge_kaifamianji,pcNormKPIFactory.address).then(function(data){
                $scope.func(data.headers,data.values,".tBodyer:first",1,"quanyiqian_biaoge_xiangmu_kaifamianji");
                $scope.quanyiqianjiequ(".tBodyer:first")
            })
            $(".table_back").css("display","none")
        })
        //点击权益后变化
        $(".fouthLi").click(function(){
            $(".fouthLi").addClass("liActive").siblings().removeClass("liActive");
            $scope.fengongsi=pcNormKPIFactory.quanyihou_biaoge_kaifamianji;
            $scope.chengshi=pcNormKPIFactory.quanyihou_biaoge_chengshi_kaifamianji;
            $scope.fengongsixiangxi="quanyihou_biaoge_xiangmu_kaifamianji";
            $scope.chengshi=angular.copy($scope.chengshi);
            $scope.chengshi.metadata.push(
                { "jaql": {
                        "table": "商住合作业务指标",
                        "column": "FNAME_L2",
                        "dim": "[商住合作业务指标.FNAME_L2]",
                        "datatype": "text",
                        "merged": true,
                        "title": "城市"
                    }}
            );
            $scope.quanyi=false;
            $scope.circleHide=false;
            $scope.circleHide1=true;
            //条形图
            pingAnDataServices.getData(pcNormKPIFactory.quanyihou_tiaoxingtu_kaifamianji,pcNormKPIFactory.address).then(function(data){
                $scope.$broadcast('to-childNorm', data);
                // $scope.pNumber=(data.values[0][0].data/10000).toFixed(2)
            })
            //表格
            pingAnDataServices.getData(pcNormKPIFactory.quanyihou_biaoge_kaifamianji,pcNormKPIFactory.address).then(function(data){

                $scope.func(data.headers,data.values,".tBodyer:first",1,"quanyihou_biaoge_xiangmu_kaifamianji");
                $scope.quanyihoujiequ(".tBodyer:first")
            })
            $(".table_back").css("display","none")
        })
    });
    //项目现金
    $("#xiangmuxianjinli").click(function(){
        $scope.circleHide=false;
        $scope.circleHide1=true;
        $scope.quanyiyincang=true;
        $scope.fengongsi=pcNormKPIFactory.xiangmuxianjinbiaoge;
        $scope.chengshi=pcNormKPIFactory.xiangmuxianjinbiaoge;
        $scope.fengongsixiangxi="xiangmuxianjinxiangxi";
        $scope.quanyi=false;
        $scope.chengshi=angular.copy($scope.chengshi);
        $scope.chengshi.metadata.push(
            { "jaql": {
                    "table": "商住合作业务指标",
                    "column": "FNAME_L2",
                    "dim": "[商住合作业务指标.FNAME_L2]",
                    "datatype": "text",
                    "merged": true,
                    "title": "城市"
                }}
        );
        //项目现金条形图
        pingAnDataServices.getData(pcNormKPIFactory.xiangmuxianjintiaoxintu,pcNormKPIFactory.address).then(function(data){
            console.log(data.values);
            $scope.$broadcast('to-childNorm', data);
            // $scope.pNumber=(data.values[0][0].data/10000).toFixed(2)
        })
        //项目现金表格
        pingAnDataServices.getData(pcNormKPIFactory.xiangmuxianjinbiaoge,pcNormKPIFactory.address).then(function(data){
            console.log(data);
            $scope.func(data.headers,data.values,".tBodyer:first",1,"xiangmuxianjinxiangxi")
        })
        $(".table_back").css("display","none");
    });

    //项目数量
    $("#xiangmushuliangli").click(function(){
        $scope.circleHide=false;
        $scope.circleHide1=true;
        $scope.quanyiyincang=true;
        $scope.quanyi=false;
        $scope.fengongsi=pcNormKPIFactory.xiangmushuliangbiaoge;
        $scope.chengshi=pcNormKPIFactory.xiangmushuliangbiaoge;
        $scope.fengongsixiangxi="xiangmushuliangbiaogexiangxi";

        $scope.chengshi=angular.copy($scope.chengshi);
        $scope.chengshi.metadata.push(
            { "jaql": {
                    "table": "商住合作业务指标",
                    "column": "FNAME_L2",
                    "dim": "[商住合作业务指标.FNAME_L2]",
                    "datatype": "text",
                    "merged": true,
                    "title": "城市"
                }}
        );
        //项目数量条形图
        pingAnDataServices.getData(pcNormKPIFactory.xiangmushuliangzhutu,pcNormKPIFactory.address).then(function(data){
            console.log(data.values);
            $scope.$broadcast('to-childNorm', data,1);
            // $scope.pNumber=(data.values[0][0].data/10000).toFixed(2)

        })
        //项目数量表格
        pingAnDataServices.getData(pcNormKPIFactory.xiangmushuliangbiaoge,pcNormKPIFactory.address).then(function(data){
            console.log(data);
            $scope.func(data.headers,data.values,".tBodyer:first",1,"xiangmushuliangbiaogexiangxi")
            // zidiaoyong()
        })
        $(".table_back").css("display","none")
        // 项目个数小数点去除
        // function zidiaoyong(){
        //     $(".tBodyer:first tr").each(function(index,obj){
        //         //console.log(index);
        //         if(index==0){
        //             $(obj).children("td").eq(1).text($(obj).children("td").eq(1).text())
        //             $(obj).children("td").eq(2).text($(obj).children("td").eq(2).text())
        //         }else{
        //             $(obj).children("td").eq(1).text(parseInt($(obj).children("td").eq(1).text()))
        //             $(obj).children("td").eq(2).text(parseInt($(obj).children("td").eq(2).text()))
        //         }
        //     })
        // }
    });

    //权益销售金额
    $("#quanyixiaoshoujineli").click(function(){
        $(".fouthLi").unbind();
        $(".thirdLi").unbind();
        $scope.circleHide=false;
        $scope.circleHide1=true;
        $scope.quanyiyincang=false;
        $scope.fengongsi=pcNormKPIFactory.quanyihou_biaoge;
        $scope.chengshi=pcNormKPIFactory.quanyihou_biaoge_chengshi;
        $scope.fengongsixiangxi="quanyihou_biaoge_xiangmu";
        $scope.chengshi=angular.copy($scope.chengshi);
        $scope.chengshi.metadata.push(
            { "jaql": {
                    "table": "商住合作业务指标",
                    "column": "FNAME_L2",
                    "dim": "[商住合作业务指标.FNAME_L2]",
                    "datatype": "text",
                    "merged": true,
                    "title": "城市"
                }}
        );
        $scope.quanyi=false;
        $(".fouthLi").addClass("liActive").siblings().removeClass("liActive");
        //权益销售金额条形图
        pingAnDataServices.getData(pcNormKPIFactory.quanyihou_tiaoxingtu,pcNormKPIFactory.address).then(function(data){
            $scope.$broadcast('to-childNorm', data);
            // $scope.pNumber=(data.values[0][0].data/10000).toFixed(2)
        })
        //权益销售金额表格
        pingAnDataServices.getData(pcNormKPIFactory.quanyihou_biaoge,pcNormKPIFactory.address).then(function(data){
            $scope.func(data.headers,data.values,".tBodyer:first",1,"quanyihou_biaoge_xiangmu");
            $scope.quanyihoujiequ(".tBodyer:first");
        })
        $(".table_back").css("display","none")
        //点击权益前变化
        $(".thirdLi").click(function(){
            $(".thirdLi").addClass("liActive").siblings().removeClass("liActive");
            $scope.fengongsi1=pcNormKPIFactory.quanyiqian_biaoge;
            $scope.chengshi1=pcNormKPIFactory.quanyiqian_biaoge_chengshi;
            $scope.fengongsixiangxi1="quanyiqian_biaoge_xiangmu";
            $scope.chengshi1=angular.copy($scope.chengshi1);
            $scope.chengshi1.metadata.push(
                { "jaql": {
                        "table": "商住合作业务指标",
                        "column": "FNAME_L2",
                        "dim": "[商住合作业务指标.FNAME_L2]",
                        "datatype": "text",
                        "merged": true,
                        "title": "城市"
                    }}
            );
            $scope.quanyi=true;
            $scope.circleHide=false;
            $scope.circleHide1=true;
            //条形图
            pingAnDataServices.getData(pcNormKPIFactory.quanyiqian_tiaoxingtu,pcNormKPIFactory.address).then(function(data){
                $scope.$broadcast('to-childNorm', data);
                // $scope.pNumber=(data.values[0][0].data/10000).toFixed(2)
            })
            //表格
            pingAnDataServices.getData(pcNormKPIFactory.quanyiqian_biaoge,pcNormKPIFactory.address).then(function(data){
                console.log(data)
                $scope.func(data.headers,data.values,".tBodyer:first",1,"quanyiqian_biaoge_xiangmu");
                $scope.quanyiqianjiequ(".tBodyer:first");
            })
            $(".table_back").css("display","none")
        })
        //点击权益后变化
        $(".fouthLi").click(function(){
            $(".fouthLi").addClass("liActive").siblings().removeClass("liActive");
            $scope.fengongsi=pcNormKPIFactory.quanyihou_biaoge;
            $scope.chengshi=pcNormKPIFactory.quanyihou_biaoge_chengshi;
            $scope.fengongsixiangxi="quanyihou_biaoge_xiangmu";
            $scope.chengshi=angular.copy($scope.chengshi);
            $scope.chengshi.metadata.push(
                { "jaql": {
                        "table": "商住合作业务指标",
                        "column": "FNAME_L2",
                        "dim": "[商住合作业务指标.FNAME_L2]",
                        "datatype": "text",
                        "merged": true,
                        "title": "城市"
                    }}
            );
            $scope.quanyi=false;
            $scope.circleHide=false;
            $scope.circleHide1=true;
            //条形图
            pingAnDataServices.getData(pcNormKPIFactory.quanyihou_tiaoxingtu,pcNormKPIFactory.address).then(function(data){
                $scope.$broadcast('to-childNorm', data);
                // $scope.pNumber=(data.values[0][0].data/10000).toFixed(2)
            })
            //表格
            pingAnDataServices.getData(pcNormKPIFactory.quanyihou_biaoge,pcNormKPIFactory.address).then(function(data){
                $scope.func(data.headers,data.values,".tBodyer:first",1,"quanyihou_biaoge_xiangmu");
                $scope.quanyihoujiequ(".tBodyer:first");
            })
            $(".table_back").css("display","none")
        })
    });

    $("#xiangmuxiaoshouhuikuanli").click(function(){
        $(".fouthLi").unbind();
        $(".thirdLi").unbind();
        $scope.circleHide=false;
        $scope.circleHide1=true;
        $scope.quanyiyincang=false;
        $scope.fengongsi=pcNormKPIFactory.quanyihou_biaoge_xiangmuhuikuan;
        $scope.fengongsixiangxi="quanyihou_biaoge_xiangmu_xiangmuhuikuan";
        $scope.chengshi=pcNormKPIFactory.quanyihou_biaoge_chengshi_xiangmuhuikuan;
        $scope.chengshi=angular.copy($scope.chengshi);
        $scope.chengshi.metadata.push(
            { "jaql": {
                    "table": "商住合作业务指标",
                    "column": "FNAME_L2",
                    "dim": "[商住合作业务指标.FNAME_L2]",
                    "datatype": "text",
                    "merged": true,
                    "title": "城市",

                }}
        );
        $scope.quanyi=false;
        $(".fouthLi").addClass("liActive").siblings().removeClass("liActive");
        //kpi销售面积条形图
        pingAnDataServices.getData(pcNormKPIFactory.quanyihou_tiaoxingtu_xiangmuhuikuan,pcNormKPIFactory.address).then(function(data){
            $scope.$broadcast('to-childNorm', data);
            // $scope.pNumber=(data.values[0][0].data/10000).toFixed(2)
        })
        //kpi销售面积表格
        pingAnDataServices.getData(pcNormKPIFactory.quanyihou_biaoge_xiangmuhuikuan,pcNormKPIFactory.address).then(function(data){
            $scope.func(data.headers,data.values,".tBodyer:first",1,"quanyihou_biaoge_xiangmu_xiangmuhuikuan");
            $scope.quanyiqianjiequ(".tBodyer:first")
        });
        $(".table_back").css("display","none")
        $(".thirdLi").click(function(){
            $(".thirdLi").addClass("liActive").siblings().removeClass("liActive");
            $scope.fengongsi1=pcNormKPIFactory.quanyiqian_biaoge_xiangmuhuikuan;
            $scope.chengshi1=pcNormKPIFactory.quanyiqian_biaoge_chengshi_xiangmuhuikuan;
            $scope.fengongsixiangxi1="quanyiqian_biaoge_xiangmu_xiangmuhuikuan";
            $scope.chengshi1=angular.copy($scope.chengshi1);
            $scope.chengshi1.metadata.push(
                { "jaql": {
                        "table": "商住合作业务指标",
                        "column": "FNAME_L2",
                        "dim": "[商住合作业务指标.FNAME_L2]",
                        "datatype": "text",
                        "merged": true,
                        "title": "城市"
                    }}
            );
            $scope.quanyi=true;
            $scope.circleHide=false;
            $scope.circleHide1=true;
            //条形图
            pingAnDataServices.getData(pcNormKPIFactory.quanyiqian_tiaoxingtu_xiangmuhuikuan,pcNormKPIFactory.address).then(function(data){
                $scope.$broadcast('to-childNorm', data);
                // $scope.pNumber=(data.values[0][0].data/10000).toFixed(2)
            })
            //表格
            pingAnDataServices.getData(pcNormKPIFactory.quanyiqian_biaoge_xiangmuhuikuan,pcNormKPIFactory.address).then(function(data){
                $scope.func(data.headers,data.values,".tBodyer:first",1,"quanyiqian_biaoge_xiangmu_xiangmuhuikuan");
                $scope.quanyiqianjiequ(".tBodyer:first")
            })
            $(".table_back").css("display","none")
        })
        //点击权益后变化
        $(".fouthLi").click(function(){
            $(".fouthLi").addClass("liActive").siblings().removeClass("liActive");
            $scope.fengongsi=pcNormKPIFactory.quanyihou_biaoge_xiangmuhuikuan;
            $scope.chengshi=pcNormKPIFactory.quanyihou_biaoge_chengshi_xiangmuhuikuan;
            $scope.fengongsixiangxi="quanyihou_biaoge_xiangmu_xiangmuhuikuan";
            $scope.chengshi=angular.copy($scope.chengshi);
            $scope.chengshi.metadata.push(
                { "jaql": {
                        "table": "商住合作业务指标",
                        "column": "FNAME_L2",
                        "dim": "[商住合作业务指标.FNAME_L2]",
                        "datatype": "text",
                        "merged": true,
                        "title": "城市"
                    }}
            );
            $scope.quanyi=false;
            $scope.circleHide=false;
            $scope.circleHide1=true;
            //条形图
            pingAnDataServices.getData(pcNormKPIFactory.quanyihou_tiaoxingtu_xiangmuhuikuan,pcNormKPIFactory.address).then(function(data){
                $scope.$broadcast('to-childNorm', data);
                // $scope.pNumber=(data.values[0][0].data/10000).toFixed(2)
            })
            //表格
            pingAnDataServices.getData(pcNormKPIFactory.quanyihou_biaoge_xiangmuhuikuan,pcNormKPIFactory.address).then(function(data){
                $scope.func(data.headers,data.values,".tBodyer:first",1,"quanyihou_biaoge_xiangmu_xiangmuhuikuan")
                $scope.quanyihoujiequ(".tBodyer:first")
            })
            $(".table_back").css("display","none")
        })
    });

    //收益
    $("#shouyili").click(function(){
        $scope.circleHide=false;
        $scope.circleHide1=true;
        $scope.quanyiyincang=true;
        $scope.quanyi=false;
        $scope.fengongsi=pcNormKPIFactory.shouyibiaoge;
        $scope.chengshi=pcNormKPIFactory.shouyibiaoge;
        $scope.fengongsixiangxi="shouyixiangxi";
        $scope.chengshi=angular.copy($scope.chengshi);
        $scope.chengshi.metadata.push(
            { "jaql": {
                    "table": "商住合作业务指标",
                    "column": "FNAME_L2",
                    "dim": "[商住合作业务指标.FNAME_L2]",
                    "datatype": "text",
                    "merged": true,
                    "title": "城市"
                }}
        );
        //收益条形图
        pingAnDataServices.getData(pcNormKPIFactory.shouyizhutu,pcNormKPIFactory.address).then(function(data){
            $scope.$broadcast('to-childNorm', data);
            // $scope.pNumber=(data.values[0][0].data/10000).toFixed(2)
        })
        //收益表格
        pingAnDataServices.getData(pcNormKPIFactory.shouyibiaoge,pcNormKPIFactory.address).then(function(data){
            var sum=0;
            for (var i=0;i<data.values.length;i++){
                console.log(data.values[i][1].data);
                sum=sum+data.values[i][1].data;
            }
            $scope.func(data.headers,data.values,".tBodyer:first",1,"shouyixiangxi");
        })
        $(".table_back").css("display","none")
    });

    //kpi销售面积
    $("#xiaoshoumianjili").click(function(){
        $(".fouthLi").unbind();
        $(".thirdLi").unbind();
        $scope.circleHide=false;
        $scope.circleHide1=true;
        $scope.quanyiyincang=false;
        $scope.fengongsi=pcNormKPIFactory.quanyiqian_biaoge_xiaoshoumianji;
        $scope.fengongsixiangxi="quanyiqian_biaoge_xiangmu_xiaoshoumianji";
        $scope.chengshi=pcNormKPIFactory.quanyiqian_biaoge_chengshi_xiaoshoumianji;
        $scope.chengshi=angular.copy($scope.chengshi);
        $scope.chengshi.metadata.push(
            { "jaql": {
                    "table": "商住合作业务指标",
                    "column": "FNAME_L2",
                    "dim": "[商住合作业务指标.FNAME_L2]",
                    "datatype": "text",
                    "merged": true,
                    "title": "城市",

                }}
        );
        $scope.quanyi=false;
        $(".thirdLi").addClass("liActive").siblings().removeClass("liActive");
        //kpi销售面积条形图
        pingAnDataServices.getData(pcNormKPIFactory.quanyiqian_tiaoxingtu_xiaoshoumianji,pcNormKPIFactory.address).then(function(data){
            $scope.$broadcast('to-childNorm', data);
            // $scope.pNumber=(data.values[0][0].data/10000).toFixed(2)
        })
        //kpi销售面积表格
        pingAnDataServices.getData(pcNormKPIFactory.quanyiqian_biaoge_xiaoshoumianji,pcNormKPIFactory.address).then(function(data){
            $scope.func(data.headers,data.values,".tBodyer:first",1,"quanyiqian_biaoge_xiangmu_xiaoshoumianji");
            $scope.quanyiqianjiequ(".tBodyer:first")
        })
        $(".table_back").css("display","none")
        $(".thirdLi").click(function(){
            $(".thirdLi").addClass("liActive").siblings().removeClass("liActive");
            $scope.fengongsi1=pcNormKPIFactory.quanyiqian_biaoge_xiaoshoumianji;
            $scope.chengshi1=pcNormKPIFactory.quanyiqian_biaoge_chengshi_xiaoshoumianji;
            $scope.fengongsixiangxi1="quanyiqian_biaoge_xiangmu_xiaoshoumianji";
            $scope.chengshi1=angular.copy($scope.chengshi1);
            $scope.chengshi1.metadata.push(
                { "jaql": {
                        "table": "商住合作业务指标",
                        "column": "FNAME_L2",
                        "dim": "[商住合作业务指标.FNAME_L2]",
                        "datatype": "text",
                        "merged": true,
                        "title": "城市"
                    }}
            );
            $scope.quanyi=true;
            $scope.circleHide=false;
            $scope.circleHide1=true;
            //条形图
            pingAnDataServices.getData(pcNormKPIFactory.quanyiqian_tiaoxingtu_xiaoshoumianji,pcNormKPIFactory.address).then(function(data){
                $scope.$broadcast('to-childNorm', data);
                // $scope.pNumber=(data.values[0][0].data/10000).toFixed(2)
            })
            //表格
            pingAnDataServices.getData(pcNormKPIFactory.quanyiqian_biaoge_xiaoshoumianji,pcNormKPIFactory.address).then(function(data){
                $scope.func(data.headers,data.values,".tBodyer:first",1,"quanyiqian_biaoge_xiangmu_xiaoshoumianji");
                $scope.quanyiqianjiequ(".tBodyer:first")
            })
            $(".table_back").css("display","none")
        })
        //点击权益后变化
        $(".fouthLi").click(function(){
            $(".fouthLi").addClass("liActive").siblings().removeClass("liActive");
            $scope.fengongsi=pcNormKPIFactory.quanyihou_biaoge_xiaoshoumianji;
            $scope.chengshi=pcNormKPIFactory.quanyihou_biaoge_chengshi_xiaoshoumianji;
            $scope.fengongsixiangxi="quanyihou_biaoge_xiangmu_xiaoshoumianji";
            $scope.chengshi=angular.copy($scope.chengshi);
            $scope.chengshi.metadata.push(
                { "jaql": {
                        "table": "商住合作业务指标",
                        "column": "FNAME_L2",
                        "dim": "[商住合作业务指标.FNAME_L2]",
                        "datatype": "text",
                        "merged": true,
                        "title": "城市"
                    }}
            );
            $scope.quanyi=false;
            $scope.circleHide=false;
            $scope.circleHide1=true;
            //条形图
            pingAnDataServices.getData(pcNormKPIFactory.quanyihou_tiaoxingtu_xiaoshoumianji,pcNormKPIFactory.address).then(function(data){
                $scope.$broadcast('to-childNorm', data);
                // $scope.pNumber=(data.values[0][0].data/10000).toFixed(2)
            })
            //表格
            pingAnDataServices.getData(pcNormKPIFactory.quanyihou_biaoge_xiaoshoumianji,pcNormKPIFactory.address).then(function(data){
                $scope.func(data.headers,data.values,".tBodyer:first",1,"quanyihou_biaoge_xiangmu_xiaoshoumianji");
                $scope.quanyihoujiequ(".tBodyer:first")
            })
            $(".table_back").css("display","none");
        })
    });

    //实际累计回款
    $("#shijileijihuikuan").click(function(){
        $(".fouthLi").unbind();
        $(".thirdLi").unbind();
        $scope.circleHide=false;
        $scope.circleHide1=true;
        $scope.quanyiyincang=false;
        $scope.fengongsi=pcNormKPIFactory.quanyiqian_biaoge_zijinhuikuan;
        $scope.fengongsixiangxi="quanyiqian_biaoge_xiangmu_zijinhuikuan";
        $scope.chengshi=pcNormKPIFactory.quanyiqian_biaoge_chengshi_zijinhuikuan;
        $scope.chengshi=angular.copy($scope.chengshi);
        $scope.chengshi.metadata.push(
            { "jaql": {
                    "table": "商住合作业务指标",
                    "column": "FNAME_L2",
                    "dim": "[商住合作业务指标.FNAME_L2]",
                    "datatype": "text",
                    "merged": true,
                    "title": "城市",

                }}
        );
        $scope.quanyi=false;
        $(".thirdLi").addClass("liActive").siblings().removeClass("liActive");
        //kpi销售面积条形图
        pingAnDataServices.getData(pcNormKPIFactory.quanyiqian_tiaoxingtu_zijinhuikuan,pcNormKPIFactory.address).then(function(data){
            $scope.$broadcast('to-childNorm', data);
            // $scope.pNumber=(data.values[0][0].data/10000).toFixed(2)
        })
        //kpi销售面积表格
        pingAnDataServices.getData(pcNormKPIFactory.quanyiqian_biaoge_zijinhuikuan,pcNormKPIFactory.address).then(function(data){
            $scope.func(data.headers,data.values,".tBodyer:first",1,"quanyiqian_biaoge_xiangmu_zijinhuikuan");
            $scope.quanyiqianjiequ(".tBodyer:first")
        });
        //点击把表格返回按钮隐藏
        $(".table_back").css("display","none");
        $(".thirdLi").click(function(){
            $scope.quanyi=true;
            $scope.circleHide=false;
            $scope.circleHide1=true;
            $(".thirdLi").addClass("liActive").siblings().removeClass("liActive");
            $scope.fengongsi1=pcNormKPIFactory.quanyiqian_biaoge_zijinhuikuan;
            $scope.chengshi1=pcNormKPIFactory.quanyiqian_biaoge_chengshi_zijinhuikuan;
            $scope.fengongsixiangxi1="quanyiqian_biaoge_xiangmu_zijinhuikuan";
            $scope.chengshi1=angular.copy($scope.chengshi1);
            $scope.chengshi1.metadata.push(
                { "jaql": {
                        "table": "商住合作业务指标",
                        "column": "FNAME_L2",
                        "dim": "[商住合作业务指标.FNAME_L2]",
                        "datatype": "text",
                        "merged": true,
                        "title": "城市"
                    }}
            );
            //条形图
            pingAnDataServices.getData(pcNormKPIFactory.quanyiqian_tiaoxingtu_zijinhuikuan,pcNormKPIFactory.address).then(function(data){
                $scope.$broadcast('to-childNorm', data);
                // $scope.pNumber=(data.values[0][0].data/10000).toFixed(2)
            })
            //表格
            pingAnDataServices.getData(pcNormKPIFactory.quanyiqian_biaoge_zijinhuikuan,pcNormKPIFactory.address).then(function(data){
                $scope.func(data.headers,data.values,".tBodyer:first",1,"quanyiqian_biaoge_xiangmu_zijinhuikuan");
                $scope.quanyiqianjiequ(".tBodyer:first")
            })
            //点击把表格返回按钮隐藏
            $(".table_back").css("display","none");
        })
        //点击权益后变化
        $(".fouthLi").click(function(){
            $scope.quanyi=false;
            $scope.circleHide=false;
            $scope.circleHide1=true;
            $(".fouthLi").addClass("liActive").siblings().removeClass("liActive");
            $scope.fengongsi=pcNormKPIFactory.quanyihou_biaoge_zijinhuikuan;
            $scope.chengshi=pcNormKPIFactory.quanyihou_biaoge_chengshi_zijinhuikuan;
            $scope.fengongsixiangxi="quanyihou_biaoge_xiangmu_zijinhuikuan";
            $scope.chengshi=angular.copy($scope.chengshi);
            $scope.chengshi.metadata.push(
                { "jaql": {
                        "table": "商住合作业务指标",
                        "column": "FNAME_L2",
                        "dim": "[商住合作业务指标.FNAME_L2]",
                        "datatype": "text",
                        "merged": true,
                        "title": "城市"
                    }}
            );
            //条形图
            pingAnDataServices.getData(pcNormKPIFactory.quanyihou_tiaoxingtu_zijinhuikuan,pcNormKPIFactory.address).then(function(data){
                $scope.$broadcast('to-childNorm', data);
                // $scope.pNumber=(data.values[0][0].data/10000).toFixed(2)
            })
            //表格
            pingAnDataServices.getData(pcNormKPIFactory.quanyihou_biaoge_zijinhuikuan,pcNormKPIFactory.address).then(function(data){
                $scope.func(data.headers,data.values,".tBodyer:first",1,"quanyihou_biaoge_xiangmu_zijinhuikuan");
                $scope.quanyihoujiequ(".tBodyer:first")
            })
            //点击把表格返回按钮隐藏
            $(".table_back").css("display","none");
        })
    });


    $("#qiehuanchengshi").click(function(){
        if($scope.fengongsixiangxi=="xiangmushuliangbiaogexiangxi"){
            if(!$scope.quanyi){
                pingAnDataServices.getData($scope.chengshi,pcNormKPIFactory.address).then(function(data) {
                    $scope.func(data.headers,data.values,".tBodyer:first",1,null,1);

                    ziyunxing();
                    ziyunxing1();
                    $(`<span class="jiantou glyphicon glyphicon-chevron-up" style="width:20px;height:20px;opacity:.5"></span>`).appendTo($(el).find("tr").eq(0).children().eq(0))
                    // zidiaoyong()
                })
                function ziyunxing(){
                    for(let x=0;x<$(".tBodyer:first tr").length;x++){
                        if(x===0){
                            $(".tBodyer:first tr").eq(x).children("td").eq(0).text($(".tBodyer:first tr").eq(x).children("td").eq($(".tBodyer:first tr").eq(x).children("td").length-1).text());
                            $(".tBodyer:first tr").eq(x).children("td").eq($(".tBodyer:first tr").eq(x).children("td").length-1).remove();
                        }else{
                            $(".tBodyer:first tr").eq(x).children("td").eq(0).html("<a class='chengshi' style='text-decoration:none'>"+$(".tBodyer:first tr").eq(x).children("td").eq($(".tBodyer:first tr").eq(x).children("td").length-1).text()+"</a>");
                            $(".tBodyer:first tr").eq(x).children("td").eq($(".tBodyer:first tr").eq(x).children("td").length-1).remove();
                        }
                    }
                    $(".tBodyer:first tr:last").children("td:first").text("合计")
                }
                function ziyunxing1(){
                    $(".tBodyer:first .chengshi").each(function(index,obj){
                        $(obj).click(function(){
                            var abc=angular.copy($scope.chengshi);
                            abc.metadata.pop();
                            abc.metadata.push(
                                {
                                    "jaql": {
                                        "table": "商住合作业务指标",
                                        "column": "FNAME_L2",
                                        "dim": "[商住合作业务指标.FNAME_L2]",
                                        "datatype": "text",
                                        "merged": true,
                                        "title": "FNAME_L2",
                                        "filter": {
                                            "explicit": true,
                                            "multiSelection": false,
                                            "members": [
                                                ""+ $(obj).text()+""
                                            ]
                                        },
                                        "collapsed": false
                                    },
                                    "disabled": false,
                                    "panel": "scope"
                                }
                            );
                            abc.metadata[0]={
                                "jaql": {
                                    "table": "商住合作业务指标",
                                    "column": "项目名称",
                                    "dim": "[商住合作业务指标.项目名称]",
                                    "datatype": "text",
                                    "merged": true,
                                    "title": "项目名称"
                                },
                                "format": {
                                    "color": {
                                        "type": "color",
                                        "color": "transparent"
                                    }
                                },
                                "field": {
                                    "id": "[商住合作业务指标.项目名称]",
                                    "index": 0
                                },
                                "panel": "rows"
                            },
                                pingAnDataServices.getData(abc,pcNormKPIFactory.address).then(function(data) {
                                    let lasttable=$(".tBodyer:first tr").clone(true);
                                    $(".table_back").css("display","none");
                                    $scope.func(data.headers,data.values,".tBodyer:first",1,null,1);
                                    $(`<span class="jiantou glyphicon glyphicon-chevron-up" style="width:20px;height:20px;opacity:.5"></span>`).appendTo($(el).find("tr").eq(0).children().eq(0));
                                    $(".table_back").css("display","inline").click(function(){
                                        $(".tBodyer:first").empty().append(lasttable);
                                        $(".table_back").css("display","none")
                                    })
                                    //huidiaox()
                                })
                            function huidiaox(){
                                for(let x=0;x<$(".tBodyer:first tr").length;x++){
                                    $(".tBodyer:first tr").eq(x).children("td").eq($(".tBodyer:first tr").eq(x).children("td").length-1).remove();
                                }
                            }
                        })
                    })
                }
            }else{
                pingAnDataServices.getData($scope.chengshi1,pcNormKPIFactory.address).then(function(data) {
                    $scope.func(data.headers,data.values,".tBodyer:first",1,null,1);
                    ziyunxing();
                    ziyunxing1();
                    //zidiaoyong()
                    $(`<span class="jiantou glyphicon glyphicon-chevron-up" style="width:20px;height:20px;opacity:.5"></span>`).appendTo($(el).find("tr").eq(0).children().eq(0))
                })
                function ziyunxing(){
                    for(let x=0;x<$(".tBodyer:first tr").length;x++){
                        if(x===0){
                            $(".tBodyer:first tr").eq(x).children("td").eq(0).text($(".tBodyer:first tr").eq(x).children("td").eq($(".tBodyer:first tr").eq(x).children("td").length-1).text());
                            $(".tBodyer:first tr").eq(x).children("td").eq($(".tBodyer:first tr").eq(x).children("td").length-1).remove();
                        }else{
                            $(".tBodyer:first tr").eq(x).children("td").eq(0).html("<a class='chengshi' style='text-decoration:none'>"+$(".tBodyer:first tr").eq(x).children("td").eq($(".tBodyer:first tr").eq(x).children("td").length-1).text()+"</a>");
                            $(".tBodyer:first tr").eq(x).children("td").eq($(".tBodyer:first tr").eq(x).children("td").length-1).remove();
                        }
                    }
                    $(".tBodyer:first tr:last").children("td:first").text("合计")
                }
                function ziyunxing1(){
                    $(".tBodyer:first .chengshi").each(function(index,obj){
                        $(obj).click(function(){
                            var abc=angular.copy($scope.chengshi1);
                            abc.metadata.pop();
                            abc.metadata.push(
                                {
                                    "jaql": {
                                        "table": "商住合作业务指标",
                                        "column": "FNAME_L2",
                                        "dim": "[商住合作业务指标.FNAME_L2]",
                                        "datatype": "text",
                                        "merged": true,
                                        "title": "FNAME_L2",
                                        "filter": {
                                            "explicit": true,
                                            "multiSelection": false,
                                            "members": [
                                                ""+ $(obj).text()+""
                                            ]
                                        },
                                        "collapsed": false
                                    },
                                    "disabled": false,
                                    "panel": "scope"
                                }
                            );
                            abc.metadata[0]={
                                "jaql": {
                                    "table": "商住合作业务指标",
                                    "column": "项目名称",
                                    "dim": "[商住合作业务指标.项目名称]",
                                    "datatype": "text",
                                    "merged": true,
                                    "title": "项目名称"
                                },
                                "format": {
                                    "color": {
                                        "type": "color",
                                        "color": "transparent"
                                    }
                                },
                                "field": {
                                    "id": "[商住合作业务指标.项目名称]",
                                    "index": 0
                                },
                                "panel": "rows"
                            },
                                pingAnDataServices.getData(abc,pcNormKPIFactory.address).then(function(data) {
                                    let lasttable=$(".tBodyer:first tr").clone(true)
                                    $(".table_back").css("display","none")
                                    $scope.func(data.headers,data.values,".tBodyer:first",1,null,1);
                                    $(`<span class="jiantou glyphicon glyphicon-chevron-up" style="width:20px;height:20px;opacity:.5"></span>`).appendTo($(el).find("tr").eq(0).children().eq(0))
                                    $(".table_back").css("display","inline").click(function(){
                                        $(".tBodyer:first").empty().append(lasttable);
                                        $(".table_back").css("display","none")
                                    })
                                    //huidiaox()
                                })
                            function huidiaox(){
                                for(let x=0;x<$(".tBodyer:first tr").length;x++){
                                    $(".tBodyer:first tr").eq(x).children("td").eq($(".tBodyer:first tr").eq(x).children("td").length-1).remove();
                                }
                            }
                        })
                    })
                }
            }
        }else{
            if(!$scope.quanyi){
                pingAnDataServices.getData($scope.chengshi,pcNormKPIFactory.address).then(function(data) {
                    $scope.func(data.headers,data.values,".tBodyer:first",1,null,1);
                    ziyunxing();
                    ziyunxing1();
                })
                function ziyunxing(){
                    for(let x=0;x<$(".tBodyer:first tr").length;x++){
                        if(x===0){
                            $(".tBodyer:first tr").eq(x).children("td").eq(0).text($(".tBodyer:first tr").eq(x).children("td").eq($(".tBodyer:first tr").eq(x).children("td").length-1).text());
                            $(".tBodyer:first tr").eq(x).children("td").eq($(".tBodyer:first tr").eq(x).children("td").length-1).remove();
                        }else{
                            $(".tBodyer:first tr").eq(x).children("td").eq(0).html("<a class='chengshi' style='text-decoration:none'>"+$(".tBodyer:first tr").eq(x).children("td").eq($(".tBodyer:first tr").eq(x).children("td").length-1).text()+"</a>");
                            $(".tBodyer:first tr").eq(x).children("td").eq($(".tBodyer:first tr").eq(x).children("td").length-1).remove();
                        }
                    }
                    $(".tBodyer:first tr:last").children("td:first").text("合计")
                }
                function ziyunxing1(){
                    $(".tBodyer:first .chengshi").each(function(index,obj){
                        $(obj).click(function(){
                            var abc=angular.copy($scope.chengshi);
                            //abc.metadata.pop();
                            abc.metadata.push(
                                {
                                    "jaql": {
                                        "table": "商住合作业务指标",
                                        "column": "FNAME_L2",
                                        "dim": "[商住合作业务指标.FNAME_L2]",
                                        "datatype": "text",
                                        "merged": true,
                                        "title": "FNAME_L2",
                                        "filter": {
                                            "explicit": true,
                                            "multiSelection": false,
                                            "members": [
                                                ""+ $(obj).text()+""
                                            ]
                                        },
                                        "collapsed": false
                                    },
                                    "disabled": false,
                                    "panel": "scope"
                                }
                            );
                            abc.metadata[0]={
                                "jaql": {
                                    "table": "商住合作业务指标",
                                    "column": "项目名称",
                                    "dim": "[商住合作业务指标.项目名称]",
                                    "datatype": "text",
                                    "merged": true,
                                    "title": "项目名称"
                                },
                                "format": {
                                    "color": {
                                        "type": "color",
                                        "color": "transparent"
                                    }
                                },
                                "field": {
                                    "id": "[商住合作业务指标.项目名称]",
                                    "index": 0
                                },
                                "panel": "rows"
                            },
                                pingAnDataServices.getData(abc,pcNormKPIFactory.address).then(function(data) {
                                    let lasttable=$(".tBodyer:first tr").clone(true);
                                    $(".table_back").css("display","none")
                                    $scope.func(data.headers,data.values,".tBodyer:first",1,null,1);
                                    huidiaox();
                                    $(".table_back").css("display","inline").click(function(){
                                        $(".tBodyer:first").empty().append(lasttable);
                                        $(".table_back").css("display","none")
                                    })
                                })
                            function huidiaox(){
                                for(let x=0;x<$(".tBodyer:first tr").length;x++){
                                    $(".tBodyer:first tr").eq(x).children("td").eq($(".tBodyer:first tr").eq(x).children("td").length-1).remove();
                                }
                            }
                        })
                    })
                }
            }else{
                pingAnDataServices.getData($scope.chengshi1,pcNormKPIFactory.address).then(function(data) {
                    $scope.func(data.headers,data.values,".tBodyer:first",1,null,1);
                    ziyunxing();
                    ziyunxing1();
                })
                function ziyunxing(){
                    for(let x=0;x<$(".tBodyer:first tr").length;x++){
                        if(x===0){
                            $(".tBodyer:first tr").eq(x).children("td").eq(0).text($(".tBodyer:first tr").eq(x).children("td").eq($(".tBodyer:first tr").eq(x).children("td").length-1).text());
                            $(".tBodyer:first tr").eq(x).children("td").eq($(".tBodyer:first tr").eq(x).children("td").length-1).remove();
                        }else{
                            $(".tBodyer:first tr").eq(x).children("td").eq(0).html("<a class='chengshi' style='text-decoration:none'>"+$(".tBodyer:first tr").eq(x).children("td").eq($(".tBodyer:first tr").eq(x).children("td").length-1).text()+"</a>");
                            $(".tBodyer:first tr").eq(x).children("td").eq($(".tBodyer:first tr").eq(x).children("td").length-1).remove();
                        }
                    }
                    $(".tBodyer:first tr:last").children("td:first").text("合计")
                }
                function ziyunxing1(){
                    $(".tBodyer:first .chengshi").each(function(index,obj){
                        $(obj).click(function(){
                            var abc=angular.copy($scope.chengshi1);
                            //abc.metadata.pop();
                            abc.metadata.push(
                                {
                                    "jaql": {
                                        "table": "商住合作业务指标",
                                        "column": "FNAME_L2",
                                        "dim": "[商住合作业务指标.FNAME_L2]",
                                        "datatype": "text",
                                        "merged": true,
                                        "title": "FNAME_L2",
                                        "filter": {
                                            "explicit": true,
                                            "multiSelection": false,
                                            "members": [
                                                ""+ $(obj).text()+""
                                            ]
                                        },
                                        "collapsed": false
                                    },
                                    "disabled": false,
                                    "panel": "scope"
                                }
                            );
                            abc.metadata[0]={
                                "jaql": {
                                    "table": "商住合作业务指标",
                                    "column": "项目名称",
                                    "dim": "[商住合作业务指标.项目名称]",
                                    "datatype": "text",
                                    "merged": true,
                                    "title": "项目名称"
                                },
                                "format": {
                                    "color": {
                                        "type": "color",
                                        "color": "transparent"
                                    }
                                },
                                "field": {
                                    "id": "[商住合作业务指标.项目名称]",
                                    "index": 0
                                },
                                "panel": "rows"
                            },
                                pingAnDataServices.getData(abc,pcNormKPIFactory.address).then(function(data) {
                                    let lasttable=$(".tBodyer:first tr").clone(true);
                                    $(".table_back").css("display","none")
                                    $scope.func(data.headers,data.values,".tBodyer:first",1,null,1);
                                    huidiaox();
                                    $(".table_back").css("display","inline").click(function(){
                                        $(".tBodyer:first").empty().append(lasttable);
                                        $(".table_back").css("display","none")
                                    })
                                })
                            function huidiaox(){
                                for(let x=0;x<$(".tBodyer:first tr").length;x++){
                                    $(".tBodyer:first tr").eq(x).children("td").eq($(".tBodyer:first tr").eq(x).children("td").length-1).remove();
                                }
                            }
                        })
                    })
                }
            }
        }

// 项目个数小数点去除
//         function zidiaoyong(){
//             $(".tBodyer:first tr").each(function(index,obj){
//                 //console.log(index);
//                 if(index==0){
//                     $(obj).children("td").eq(1).text($(obj).children("td").eq(1).text())
//                     $(obj).children("td").eq(2).text($(obj).children("td").eq(2).text())
//                 }else{
//                     $(obj).children("td").eq(1).text(parseInt($(obj).children("td").eq(1).text()))
//                     $(obj).children("td").eq(2).text(parseInt($(obj).children("td").eq(2).text()))
//                 }
//             })
//         }
        $scope.quanyihoujiequ(".tBodyer:first")
    });

    $("#qiehuanfengongsi").click(function(){

        $scope.$broadcast('fengongsi', 1);

        if($scope.fengongsixiangxi=="xiangmushuliangbiaogexiangxi"){
            if(!$scope.quanyi){
                pingAnDataServices.getData($scope.fengongsi,pcNormKPIFactory.address).then(function(data){
                    $scope.func(data.headers,data.values,".tBodyer:first",1,""+$scope.fengongsixiangxi+"")
                    // zidiaoyong()
                })
            }else{
                pingAnDataServices.getData($scope.fengongsi1,pcNormKPIFactory.address).then(function(data){
                    $scope.func(data.headers,data.values,".tBodyer:first",1,""+$scope.fengongsixiangxi+"")
                    // zidiaoyong()
                })
            }

        }else{
            if(!$scope.quanyi){
                pingAnDataServices.getData($scope.fengongsi,pcNormKPIFactory.address).then(function(data){
                    $scope.func(data.headers,data.values,".tBodyer:first",1,""+$scope.fengongsixiangxi+"")
                })
            }else{
                pingAnDataServices.getData($scope.fengongsi1,pcNormKPIFactory.address).then(function(data){
                    $scope.func(data.headers,data.values,".tBodyer:first",1,""+$scope.fengongsixiangxi+"")
                })
            }

        }
        // 项目个数小数点去除
        // function zidiaoyong(){
        //     $(".tBodyer:first tr").each(function(index,obj){
        //         //console.log(index);
        //         if(index==0){
        //             $(obj).children("td").eq(1).text($(obj).children("td").eq(1).text())
        //             $(obj).children("td").eq(2).text($(obj).children("td").eq(2).text())
        //         }else{
        //             $(obj).children("td").eq(1).text(parseInt($(obj).children("td").eq(1).text()))
        //             $(obj).children("td").eq(2).text(parseInt($(obj).children("td").eq(2).text()))
        //         }
        //     })
        // }



    });
    // $scope.pNumber

    // KPI数据获取！
    //已投资额kpi
    pingAnDataServices.getData(pcNormKPIFactory.yitouziekpi,pcNormKPIFactory.address).then(function(data){
        $scope.pNumberkpi=(data.values[0].data).toFixed(2)
        // console.log(data);
        $scope.$broadcast('yitouziekpi',$scope.pNumberkpi);

    })
    //已投资额
    pingAnDataServices.getData(pcNormKPIFactory.Norm_invested_amount,pcNormKPIFactory.address).then(function(data){
        $scope.pNumber=$scope.zhibiaoNaN((data.values[0].data).toFixed(2))
        $scope.$broadcast('yitouzieshiji',$scope.pNumber);

    })


    //已投资额的条形图
    pingAnDataServices.getData(pcNormKPIFactory.yitouzietiaoxingtu,pcNormKPIFactory.address).then(function(data){
        $scope.$broadcast('to-childNorm', data);
        // $scope.pNumber=(data.values[0][0].data/10000).toFixed(2)
    })
    //已投资额表格
     pingAnDataServices.getData(pcNormKPIFactory.yitouziebiaoge,pcNormKPIFactory.address).then(function(data){
        $scope.func(data.headers,data.values,".tBodyer:first",1,"yutiyzuebiaogexiangxixiangmu")
    })

    $scope.fengongsi=pcNormKPIFactory.yitouziebiaoge;
    $scope.fengongsixiangxi="yutiyzuebiaogexiangxixiangmu";
    $scope.chengshi=pcNormKPIFactory.yitouziebiaoge;
    $scope.chengshi=angular.copy($scope.chengshi);
    $scope.chengshi.metadata.push(
        { "jaql": {
                "table": "商住合作业务指标",
                "column": "FNAME_L2",
                "dim": "[商住合作业务指标.FNAME_L2]",
                "datatype": "text",
                "merged": true,
                "title": "城市"
            }}
    );
    //平安销售回款kpi
    pingAnDataServices.getData(pcNormKPIFactory.pinganxiaoshouhuikuankpi,pcNormKPIFactory.address).then(function(data){
        $scope.pNumber2kpi=(data.values[0].data).toFixed(2)
        // console.log(data);
        $scope.$broadcast('pinganxiaoshouhuikuankpi',$scope.pNumber2kpi);

    })
    //平安销售回款
    pingAnDataServices.getData(pcNormKPIFactory.Norm_sales_return,pcNormKPIFactory.address).then(function(data){
        $scope.pNumber2=$scope.zhibiaoNaN((data.values[0].data).toFixed(2))

    })
    //权益销售回款kpi
    pingAnDataServices.getData(pcNormKPIFactory.quanyixiaoshouhuikuankpi,pcNormKPIFactory.address).then(function(data){
        $scope.pNumber3kpi=(data.values[0].data).toFixed(2)
        // console.log(data);
        $scope.$broadcast('quanyixiaoshouhuikuankpi',$scope.pNumber3kpi);

    })
    //权益销售回款
    pingAnDataServices.getData(pcNormKPIFactory.Norm_equity_sales_return,pcNormKPIFactory.address).then(function(data){
        $scope.pNumber3=$scope.zhibiaoNaN((data.values[0].data).toFixed(2));
        $scope.pNumber3=$scope.xiaoshouhuikuane;

    })
    //已实现利润kpi
    pingAnDataServices.getData(pcNormKPIFactory.yishixianlirunkpi,pcNormKPIFactory.address).then(function(data){
        $scope.pNumber4kpi=(data.values[0].data).toFixed(2)
        // console.log(pNumber4kpi);
        $scope.$broadcast('yishixianlirunkpi',$scope.pNumber4kpi);

    })
    //已实现利润
    pingAnDataServices.getData(pcNormKPIFactory.yishixianlirun,pcNormKPIFactory.address).then(function(data){
        $scope.pNumber4=$scope.zhibiaoNaN((data.values[0].data).toFixed(2))
        $scope.$broadcast('yishixianlirunshiji',$scope.pNumber4);

    })
    // 非KPI数据获取！
    pingAnDataServices.getData(pcNormKPIFactory.Norm_developed_area,pcNormKPIFactory.address).then(function(data){
        // console.log(data.values);
        $scope.pNumber11=(data.values[0][0].data/10000).toFixed(2)
    })
    pingAnDataServices.getData(pcNormKPIFactory.Norm_profit,pcNormKPIFactory.address).then(function(data){
        // console.log(data.values);
        $scope.pNumber66=(data.values[0][0].data/100000000).toFixed(2)
    })
    // pingAnDataServices.getData(pcNormKPIFactory.Norm_number_projects,pcNormKPIFactory.address).then(function(data){
    //     // console.log(data.values);
    //     $scope.pNumber33=data.values[0][0].data
    // })
    pingAnDataServices.getData(pcNormKPIFactory.Norm_sales_area,pcNormKPIFactory.address).then(function(data){
        // console.log(data.values);
        $scope.pNumber77=(data.values[0][0].data/10000).toFixed(2)
    })
    //已开发面积
	pingAnDataServices.getData(pcNormKPIFactory.kaifamianji,pcNormKPIFactory.address).then(function(data){
        $scope.pNumber11=$scope.zhibiaoNaN((data.values[0].data).toFixed(2))
    })
    //项目销售回款
    pingAnDataServices.getData(pcNormKPIFactory.xiangmuhuikuan,pcNormKPIFactory.address).then(function(data){
        // console.log(data.values);
        $scope.pNumber55=data.values[0].data.toFixed(2);
        // $scope.pNumber55=$scope.zhibiaoNaN(data.values[0].data.toFixed(2));

        $scope.$broadcast('quanyixiaoshouhuikuanshiji',$scope.pNumber55);
    })
	//项目现金
    pingAnDataServices.getData(pcNormKPIFactory.xiangmuxianjinzhibiaozhi,pcNormKPIFactory.address).then(function(data){
        $scope.xiangmuxianjinzhibiao=$scope.zhibiaoNaN(data.values[0].data.toFixed(2))
    })
	//已投项目数量
	pingAnDataServices.getData(pcNormKPIFactory.Norm_number_projects,pcNormKPIFactory.address).then(function(data){
        $scope.pNumber33=data.values[0].data;
    })
	//权益销售金额
    pingAnDataServices.getData(pcNormKPIFactory.quanyihou_quanyijine,pcNormKPIFactory.address).then(function(data){
        $scope.pNumber44=$scope.zhibiaoNaN(data.values[0].data.toFixed(2))
    })
	//项目销售回款
	
	//收益
	pingAnDataServices.getData(pcNormKPIFactory.shouyi,pcNormKPIFactory.address).then(function(data){
        $scope.pNumber66=$scope.zhibiaoNaN(data.values[0].data.toFixed(2))
    })
	//销售面积
	pingAnDataServices.getData(pcNormKPIFactory.quanyiqian_xiaoshoumianji,pcNormKPIFactory.address).then(function(data){
        $scope.pNumber77=$scope.zhibiaoNaN(data.values[0].data.toFixed(2))
    })
    //资金回款金额
    pingAnDataServices.getData(pcNormKPIFactory.quanyiqian_zijinhuikuan,pcNormKPIFactory.address).then(function(data){
        $scope.pNumber88=$scope.zhibiaoNaN(data.values[0].data.toFixed(2))
        $scope.$broadcast('pinganxiaoshouhuikuanshiji',$scope.pNumber88);
    })
}])


app.controller('echartColumnControllerN', ["$scope","$http","pingAnDataServices",'pcNormKPIFactory',function($scope,$http,pingAnDataServices,pcNormKPIFactory){

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
                    // icon: 'image://./img/pingAnImg/fact.png',
                    icon:'bar'
                },{
                    name:'计划',
                    // icon: 'image://./img/pingAnImg/plan.png',
                    icon:'bar'
                }
            ],
        },
        grid: {
            left: '',
            right: '35',
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
            right:50,
            // width:'95%',
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
                    symbolSize:0,
                    /*itemStyle:{
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
                    }*/
                },
                label: {
                    normal: {
                        position: 'right',
                        show: true
                    }
                },
                //设置柱子的宽度
                // barWidth : 10,
                barWidth : '30%',
                itemStyle: {
                    //通常情况下：
                    normal:{
                        //每个柱子的颜色即为colorList数组里的每一项，如果柱子数目多于colorList的长度，则柱子颜色循环使用该数组
                        /*color: function (params){
                            var colorList = ['#27B7E9'];
                            return colorList[params.dataIndex];
                        }*/
                        // color:'#27B7E9'
                        color: function (params){
                            var colorList = ['#27B7E9','#27B7E9','#27B7E9','#27B7E9','#27B7E9','#27B7E9','#27B7E9','#27B7E9','#27B7E9','#27B7E9'];
                            return colorList[params.dataIndex];
                        },
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
            // {
            //     name: '计划',
            //     type: 'bar',
            //     data: [],
            //     markPoint : {
            //         data : [
            //
            //         ],
            //         symbolSize:0,
            //         // itemStyle:{
            //         //     normal:{
            //         //         color:'#B86167',
            //         //         label:{
            //         //         show: true,
            //         //         position: 'top',
            //         //         formatter: function (param) {
            //         //             if (param.value == 1)
            //         //                 return '';
            //         //             else
            //         //                 return '';
            //         //         }
            //         //         }
            //         //     }
            //         // }
            //     },
            //     //设置柱子的宽度
            //     // barWidth : 10,
            //     barWidth : '30%',
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
            //             /*color: function (params){
            //                 var colorList = ['#B86167'];
            //                 return colorList[params.dataIndex];
            //             }*/
            //             color:'#EB5405'
            //         },
            //         //鼠标悬停时：
            //         emphasis: {
            //             shadowBlur: 10,
            //             shadowOffsetX: 0,
            //             shadowColor: '#fff',
            //             color:'#EB5405'
            //         }
            //     },
            // }
        ]
    };
    $scope.$on('dataService', function(event,data) {
        console.log(data)
    });
    // 切换分公司高亮取消
    $scope.$on('fengongsi', function(event, data) {
        if(data==1){
            option.series[0].itemStyle.normal.color= '#27B7E9';
            mapChart.setOption(option);
        }
    });
    $scope.$on('to-childNorm', function(event,data,geshu) {
        console.log(data);
        var by = function (name) {
            return function (o, p) {
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

        var hengtiaodata = []
        var markPointdata = []
        for(var i = 0; i < data.values.length; i++) {
            // hengtiaodata.push(parseFloat(data.values[i][1].data).toFixed(2));
            // 判断小数位数,让项目数是整数
            if(geshu==1){
                hengtiaodata.push(parseInt(data.values[i][1].data));
                // hengtiaodata1.unshift(parseInt(data.values[i][1].data));
                markPointdata.push({

                    yAxis: data.values[i][0].data
                })
            }else {
                hengtiaodata.push(parseFloat(data.values[i][1].data).toFixed(2));
                // hengtiaodata1.unshift(parseFloat(data.values[i][1].data).toFixed(2));
                markPointdata.push({

                    yAxis: data.values[i][0].data
                })
            }
            markPointdata.push({
                name: "2",
                value: 1,
                xAxis: data.values[i][1].data,
                yAxis: data.values[i][0].data
            })
        }

        option.series[0].itemStyle.normal.color= '#27B7E9';

        var hengtiao = hengtiaodata.sort(function(x, y) {
            return x - y;
        }) //横条数据排序
        if((hengtiao[hengtiao.length-1])>0){
            option.xAxis.max=(hengtiao[hengtiao.length-1]*1.3).toFixed(0);

        }else {
            console.log(((Math.abs(hengtiao[0]))*1.1).toFixed(0))
            option.xAxis.max=((Math.abs(hengtiao[0]))*1.1).toFixed(0);
        }
        if(hengtiao[0]<0.1){
            option.xAxis.min=(hengtiao[0]*1.3).toFixed(0);

        }
        option.series[0].data = hengtiao; //横条数据排序完后赋值回echarts
        var markpoint = markPointdata.sort(by("xAxis")); //小点排序
        var yAxis = [] //将小点排序里的y轴名称提取称一个数组
        for(var j = 0; j < data.values.length; j++) {
            yAxis.push(markpoint[j].yAxis)
        }

        option.yAxis.data = yAxis; //将名称数组赋值给Y轴
        // option.yAxis.data=option.series[0].markPoint.data[0]
        option.series[0].markPoint.data = markpoint; //将排序好的小点赋值给echarts

        mapChart.setOption(option)


        function ziyunxing(){
            for(let x=0;x<$(".tBodyer:first tr").length;x++){
                if(x===0){
                    $(".tBodyer:first tr").eq(x).children("td").eq(0).text($(".tBodyer:first tr").eq(x).children("td").eq($(".tBodyer:first tr").eq(x).children("td").length-1).text());
                    $(".tBodyer:first tr").eq(x).children("td").eq($(".tBodyer:first tr").eq(x).children("td").length-1).remove();
                }else{
                    $(".tBodyer:first tr").eq(x).children("td").eq(0).html("<a class='chengshi' style='text-decoration:none'>"+$(".tBodyer:first tr").eq(x).children("td").eq($(".tBodyer:first tr").eq(x).children("td").length-1).text()+"</a>");
                    $(".tBodyer:first tr").eq(x).children("td").eq($(".tBodyer:first tr").eq(x).children("td").length-1).remove();
                }
            }
            $(".tBodyer:first tr:last").children("td:first").text("合计")
        }

        mapChart.on("click", function (params) {
            var colorList;
            colorList = ['#27B7E9', '#27B7E9', '#27B7E9', '#27B7E9', '#27B7E9', '#27B7E9', '#27B7E9', '#27B7E9', '#27B7E9', '#27B7E9', '#27B7E9'];
            if ($scope.circleHide1 == false) {
                for (var i = 0; i < 11; i++) {
                    if (params.dataIndex == i) {
                        colorList[i] = '#B94A51';
                    }
                }
            }
            if ($scope.circleHide1 == true) {
                colorList = ['#27B7E9', '#27B7E9', '#27B7E9', '#27B7E9', '#27B7E9', '#27B7E9', '#27B7E9', '#27B7E9', '#27B7E9', '#27B7E9', '#27B7E9'];

            }
            option.series[0].itemStyle.normal.color = function (params) {
                return colorList[params.dataIndex];
            }
            if ($scope.circleHide1 == false) {
                var fengongsidata = angular.copy($scope.chengshi);
                // fengongsidata.metadata.pop();
                fengongsidata.metadata[0] = {
                    "jaql": {
                        "table": "商住合作业务指标",
                        "column": "FNAME_L2",
                        "dim": "[商住合作业务指标.FNAME_L2]",
                        "datatype": "text",
                        "merged": true,
                        "title": "城市"
                    },
                    "format": {
                        "color": {
                            "type": "color",
                            "color": "transparent"
                        }
                    },
                    "field": {
                        "id": "[商住合作业务指标.FNAME_L2]",
                        "index": 0
                    },
                    "panel": "rows"
                }
                fengongsidata.metadata.push(
                    {
                        "jaql": {
                            "table": "商住合作业务指标",
                            "column": "城市分公司",
                            "dim": "[商住合作业务指标.城市分公司]",
                            "datatype": "text",
                            "merged": true,
                            "title": "城市分公司",
                            "filter": {
                                "explicit": true,
                                "multiSelection": false,
                                "members": [
                                    "" + params.name + ""
                                ]
                            },
                            "collapsed": false
                        },
                        "panel": "scope"
                    }
                );
                pingAnDataServices.getData(fengongsidata, pcNormKPIFactory.address).then(function (data) {
                    /*let lasttable=$(".tBodyer:first tr").clone(true);
                    $(".table_back").css("display","none")*/
                    $scope.func(data.headers, data.values, ".tBodyer:first", 1, "" + $scope.fengongsixiangxi + "")
                   /* $(".table_back").css("display","inline").click(function(){
                        $(".tBodyer:first").empty().append(lasttable);
                        $(".table_back").css("display","none")
                    })*/
                    //$scope.func(data.headers, data.values, ".tBodyer:first", 1, "" + $scope.fengongsixiangxi + "")
                    ziyunxing();
                    ziyunxing1();
                })
                function ziyunxing1() {
                    $(".tBodyer:first .chengshi").each(function (index, obj) {
                        $(obj).click(function () {
                            var abc = angular.copy($scope.chengshi);
                            abc.metadata.pop();
                            abc.metadata.push(
                                {
                                    "jaql": {
                                        "table": "商住合作业务指标",
                                        "column": "FNAME_L2",
                                        "dim": "[商住合作业务指标.FNAME_L2]",
                                        "datatype": "text",
                                        "merged": true,
                                        "title": "FNAME_L2",
                                        "filter": {
                                            "explicit": true,
                                            "multiSelection": false,
                                            "members": [
                                                "" + $(obj).text() + ""
                                            ]
                                        },
                                        "collapsed": false
                                    },
                                    "disabled": false,
                                    "panel": "scope"
                                }
                            );
                            abc.metadata[0] = {
                                "jaql": {
                                    "table": "商住合作业务指标",
                                    "column": "项目名称",
                                    "dim": "[商住合作业务指标.项目名称]",
                                    "datatype": "text",
                                    "merged": true,
                                    "title": "项目名称"
                                },
                                "format": {
                                    "color": {
                                        "type": "color",
                                        "color": "transparent"
                                    }
                                },
                                "field": {
                                    "id": "[商住合作业务指标.项目名称]",
                                    "index": 0
                                },
                                "panel": "rows"
                            },
                                pingAnDataServices.getData(abc, pcNormKPIFactory.address).then(function (data) {
                                    let lasttable=$(".tBodyer:first tr").clone(true);
                                    $(".table_back").css("display","none")
                                    $scope.func(data.headers, data.values, ".tBodyer:first", 1);
                                    $(".table_back").css("display","inline").click(function(){
                                        $(".tBodyer:first").empty().append(lasttable);
                                        $(".table_back").css("display","none")
                                    })
                                    //$scope.func(data.headers, data.values, ".tBodyer:first", 1);
                                    //huidiaox()
                                })

                            function huidiaox() {
                                for (let x = 0; x < $(".tBodyer:first tr").length; x++) {
                                    $(".tBodyer:first tr").eq(x).children("td").eq($(".tBodyer:first tr").eq(x).children("td").length - 1).remove();
                                }
                            }
                        })
                    })
                }
            }
            mapChart.setOption(option);
        })
    });

}])


app.controller('echartColumnController11',["$scope",function($scope){
    $scope.$on('yitouziekpi', function(event,kpi) {
        $scope.$on('yitouzieshiji', function(event,shiji) {
        // console.log(shiji);
        var mapChart = echarts.init(document.getElementById('container9'));
        var option9 = {
            color: ['#3398DB'],
            tooltip: {
                trigger: 'axis',
                axisPointer: {            // 坐标轴指示器，坐标轴触发有效
                    type: 'shadow'        // 默认为直线，可选为：'line' | 'shadow'
                }
            },
            grid: {
                left: '-30',
                right: '0',
                top: '0',
                bottom: '0',
                containLabel: true
            },
            xAxis: [
                {
                    /*axisLabel: {f
                        show: true,
                        textStyle: {
                            color: 'red'
                        }
                    },*/
                    type: 'category',
                    data: ['KPI', '实际'],
                    axisTick: {
                        alignWithLabel: 0
                    },
                    splitLine: {
                        show: false
                    },
                }
            ],
            yAxis: [
                {
                    min: 0,
                    max: 150,
                    type: 'value',
                    show: false,
                    splitLine: {
                        show: false
                    },
                }
            ],
            itemStyle: {
                //通常情况下：
                normal: {
                    color: '#23B6E9',
                }
            },
            series: [
                {
                    // name:'value',
                    type: 'bar',
                    barWidth: '20',
                    data: [{
                        value: kpi,
                        itemStyle: {
                            normal: {
                                color: '#FF4700'
                            }
                        }
                    }, {
                        value: shiji,
                        itemStyle: {
                            normal: {
                                color: '#49CEED'
                            }
                        }
                    }]
                }
            ]
        };
            //option9.yAxis[0].max=shiji*1.3.toFixed(0)
        mapChart.setOption(option9)
    })
    })
}])

app.controller('echartColumnController2',["$scope",function($scope){
    $scope.$on('pinganxiaoshouhuikuankpi', function(event,kpi) {
        $scope.$on('pinganxiaoshouhuikuanshiji', function(event,shiji) {
            // console.log(shiji);
    var mapChart = echarts.init(document.getElementById('container11'));
    var option1 = {
        color: ['#3398DB'],
        tooltip : {
            trigger: 'axis',
            axisPointer : {            // 坐标轴指示器，坐标轴触发有效
                type : 'shadow'        // 默认为直线，可选为：'line' | 'shadow'
            }
        },
        grid: {
            left: '-20',
            right: '',
            top:'0',
            bottom: '0',
            containLabel: true
        },
        xAxis : [
            {
                type : 'category',
                data : ['KPI', '实际'],
                splitNumber:3,
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
                // min:shiji*1.3.toFixed(0),
                // max:kpi*1.3.toFixed(0),
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
                // name:'value',
                type:'bar',
                barWidth: '20',
                data:[{
                    value:kpi,
                    itemStyle:{
                        normal:{
                            color:'#FF4700'
                        }
                    }
                },{
                    value:shiji,
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
        })
    })
}])

app.controller('echartColumnController3',["$scope",function($scope){
    $scope.$on('quanyixiaoshouhuikuankpi', function(event,kpi) {
        $scope.$on('quanyixiaoshouhuikuanshiji', function(event,shiji) {
    var mapChart = echarts.init(document.getElementById('container2'));
    var option2 = {
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
                // min:0,
                // max:kpi*1.3.toFixed(0),
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
                // name:'value',
                type:'bar',
                barWidth: '20',
                data:[{
                    value:kpi,
                    itemStyle:{
                        normal:{
                            color:'#FF4700'
                        }
                    }
                },{
                    value:shiji,
                    itemStyle:{
                        normal:{
                            color:'#49CEED'
                        }
                    }
                }]
            }
        ]
    };
    mapChart.setOption(option2)
        })
    })
}])

app.controller('echartColumnController4',["$scope",function($scope){
    $scope.$on('yishixianlirunkpi', function(event,kpi) {
        $scope.$on('yishixianlirunshiji', function(event,shiji) {
    var mapChart = echarts.init(document.getElementById('container5'));
    var option3 = {
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
                // min:0,
                // max:shiji*1.3.toFixed(0),
                type : 'value',
                show:false,
                splitLine:{
                    show:false
                },
            }
        ],
        series : [
            {
                // name:'value',
                type:'bar',
                barWidth: '20',
                data:[{
                    value:kpi,
                    itemStyle:{
                        normal:{
                            color:'#FF4700'
                        }
                    }
                },{
                    value:shiji,
                    itemStyle:{
                        normal:{
                            color:'#49CEED'
                        }
                    }
                }]
            }
        ]
    };
    mapChart.setOption(option3);
            mapChart.setOption(option3);

        })
    })
}])
//suo duan zui hou yi hang
function suoxiao(){
    var wid = $('.tBodyer tr:eq(1)').width();
    $(".tBodyer tr:last").width(wid);
    $(".tBodyer tr:first").width(wid);
}