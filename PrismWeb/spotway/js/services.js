'use strict';
var app=angular.module('app.services', []);
app.service("navverHelper",["$http", "$q", function ($http,$q) {
    this.getNav=function(){
        var defer = $q.defer();
        $http.get('/api/navver/getNav', {})
            .success(function (data, status, headers, config) {
                defer.resolve(data); 
            })
            .error(function (data, status, headers, config) {
                defer.reject();     
            });
        return defer.promise; 
    };
    this.updateNav=function(navList){
        var defer = $q.defer();
        $http.post('/api/navver/updateNav', navList)
            .success(function (data, status, headers, config) {
                defer.resolve(data); 
            })
            .error(function (data, status, headers, config) {
                defer.reject();     
            });
        return defer.promise; 
    };
    this.userNav=function(navItems,user){
        var arr=new Array();
        var subArr=new Array();
        if(user.roleName=="super"){
            return navItems;
        }
        for(var i=0;i<navItems.treeNodes.length;i++){
            for(var j=0;j<navItems.treeNodes[i].rule_power.viewID.length;j++){
                if(navItems.treeNodes[i].rule_power.viewID[j]._id==user._id){
                    arr.push(navItems.treeNodes[i]);
                }else{
                    if(user.groups){
                        for(var a=0;a<user.groups.length;a++){
                            if(navItems.treeNodes[i].rule_power.viewID[j]._id==user.groups[a]){
                                arr.push(navItems.treeNodes[i]);
                            }
                        }
                    }
                }
            }
        }
        for(var m=0;m<arr.length;m++){
            if(arr[m].nodes&&arr[m].nodes.length>0){
                for(var n=0;n<arr[m].nodes.length;n++){
                    console.log(arr[m].nodes.length)
                    for(var q=0;q<arr[m].nodes[n].rule_power.viewID.length;q++){
                        if(arr[m].nodes[n].rule_power.viewID[q]._id==user._id){
                            subArr.push(arr[m].nodes[n]);
                        }else{
                            if(user.groups){
                                for(var p=0;p<user.groups.length;p++){

                                    if(arr[m].nodes[n].rule_power.viewID[q]._id==user.groups[p]){
                                        //subArr.push(arr[m].nodes[n]);
                                        subArr=arr[m].nodes;
                                        break;
                                    }
                                }
                            }
                        }
                    }
                    arr[m].nodes=subArr;
                    subArr=[];
                }
            }
        }

        console.log(arr);
        var newUserItems={
            '_id':navItems._id,
            'treeNodes':arr
        }
        return newUserItems;
    }
}]);
app.service("userHelper",["$http", "$q", function ($http,$q) {
    this.getUser=function(id){
        var defer = $q.defer();
        $http.get('/api/users/'+id, {})
            .success(function (data, status, headers, config) {
                defer.resolve(data);
            })
            .error(function (data, status, headers, config) {
                defer.reject();
            });
        return defer.promise;
    }
    this.getUserList=function(){
        var defer = $q.defer();
        $http.get('/api/users', {})
            .success(function (data, status, headers, config) {
                defer.resolve(data);  
            })
            .error(function (data, status, headers, config) {
                defer.reject(); 
            });
        return defer.promise;
    };
    this.userAdd=function(data){
        var defer = $q.defer();
        $http.post('/api/users', data)
            .success(function (data, status, headers, config) {
                defer.resolve(data);
            })
            .error(function (data, status, headers, config) {
                defer.reject();
            });
        return defer.promise;
    };
    this.userDelete=function(data){
        var defer = $q.defer();
        $http.post('/api/users/delete', data)
            .success(function (data, status, headers, config) {
                defer.resolve(data);
            })
            .error(function (data, status, headers, config) {
                defer.reject(); 
            });
        return defer.promise;
    };
    this.userEdit=function(data,id){
        var defer = $q.defer();
        $http.put('/api/users/'+ id, data)
            .success(function (data, status, headers, config) {
                defer.resolve(data);
            })
            .error(function (data, status, headers, config) {
                defer.reject(); 
            });
        return defer.promise;
    }
    this.userGroup=function(id){
        var defer = $q.defer();
        $http.get('/api/groups/'+ id+'?usersCount=true', {})
            .success(function (data, status, headers, config) {
                defer.resolve(data);
            })
            .error(function (data, status, headers, config) {
                defer.reject();
            });
        return defer.promise;
    };
    this.userGroupList=function(){
        var defer = $q.defer();
        $http.get('/api/groups?usersCount=true', {})
            .success(function (data, status, headers, config) {
                defer.resolve(data);
            })
            .error(function (data, status, headers, config) {
                defer.reject();
            });
        return defer.promise;
    };
    this.userSearch=function(type){
        var defer = $q.defer();
        $http.get('/api/users?limit=10&search='+type, {})
            .success(function (data, status, headers, config) {
                defer.resolve(data);
            })
            .error(function (data, status, headers, config) {
                defer.reject();
            });
        return defer.promise;
    };
    this.userGroupAdd=function(data){
         var defer = $q.defer();
        $http.post(' /api/groups', data)
            .success(function (data, status, headers, config) {
                defer.resolve(data);
            })
            .error(function (data, status, headers, config) {
                defer.reject();
            });
        return defer.promise;
    };
    this.userGroupEdit=function(data,id){
        var defer = $q.defer();
        $http.put('/api/groups/'+ id, data)
            .success(function (data, status, headers, config) {
                defer.resolve(data);
            })
            .error(function (data, status, headers, config) {
                defer.reject(); 
            });
        return defer.promise;
    };
    this.userGroupUserPush=function(groupID,idArr){
        var defer = $q.defer();
        $http.post('/api/groups/'+ groupID+"/users", idArr)
            .success(function (data, status, headers, config) {
                defer.resolve(data);
            })
            .error(function (data, status, headers, config) {
                defer.reject();
            });
        return defer.promise;
    };
    this.userGroupUser=function(groupID){
        var defer = $q.defer();
        $http.get('/api/groups/'+ groupID+"/users",{})
            .success(function (data, status, headers, config) {
                defer.resolve(data);
            })
            .error(function (data, status, headers, config) {
                defer.reject();
            });
        return defer.promise;
    };
    this.getGroupsFilter=function(searchItem){
        var defer = $q.defer();
        $http.get('/api/groups/allDirectories?includeDomain=true&limit=10&search='+searchItem+'&usersCount=true',{})
            .success(function (data, status, headers, config) {
                defer.resolve(data);
            })
            .error(function (data, status, headers, config) {
                defer.reject();
            });
        return defer.promise;
    };
    this.getUsersFilter=function(searchItem){
        var defer = $q.defer();
        $http.get('/api/users/allDirectories?includeDomain=true&limit=10&search='+searchItem,{})
            .success(function (data, status, headers, config) {
                defer.resolve(data);
            })
            .error(function (data, status, headers, config) {
                defer.reject();
            });
        return defer.promise;
    };
}]);
app.service("roleHelper",["$http","$q",function($http,$q){
    this.getRolesList=function(){
        var defer = $q.defer();
        $http.get('/api/roles', {})
            .success(function (data, status, headers, config) {
                defer.resolve(data);  
            })
            .error(function (data, status, headers, config) {
                defer.reject(); 
            });
        return defer.promise;
    };
}]);
app.service("funAuthHelper",["$http","$q",function($http,$q){
    this.addAuth=function(){
        var defer = $q.defer();
        $http.post('/api/authConfig/addAuth', {})
            .success(function (data, status, headers, config) {
                defer.resolve(data);  
            })
            .error(function (data, status, headers, config) {
                defer.reject(); 
            });
        return defer.promise;
    };
    this.deleteFunAuth=function(data){
        var defer = $q.defer();
        $http.post('/api/funAuth/deleteFunAuth', data)
            .success(function (data, status, headers, config) {
                defer.resolve(data);  
            })
            .error(function (data, status, headers, config) {
                defer.reject(); 
            });
        return defer.promise;
    }
    this.updataFunAuth=function(data){
        var id=data._id;
        var defer = $q.defer();
        $http.post('/api/funAuth/updataFunAuth/'+id, data)
            .success(function (data, status, headers, config) {
                defer.resolve(data);  
            })
            .error(function (data, status, headers, config) {
                defer.reject(); 
            });
        return defer.promise;
    }
    this.addFunAuth=function(data){
        var defer = $q.defer();
        $http.post('/api/funAuth/addAuth', data)
            .success(function (data, status, headers, config) {
                defer.resolve(data);  
            })
            .error(function (data, status, headers, config) {
                defer.reject(); 
            });
        return defer.promise;
    };
    this.getAuth=function(){
        var defer = $q.defer();
        $http.get('/api/authConfig/getAuth', {})
            .success(function (data, status, headers, config) {
                defer.resolve(data);  
            })
            .error(function (data, status, headers, config) {
                defer.reject(); 
            });
        return defer.promise;
    };
    this.getFunAuth=function(){
        var defer = $q.defer();
        $http.get('/api/funAuth/getFunAuth', {})
            .success(function (data, status, headers, config) {
                defer.resolve(data);  
            })
            .error(function (data, status, headers, config) {
                defer.reject(); 
            });
        return defer.promise;
    }
}]);
app.service("sisenseHelper",["$http","$q",function($http,$q){
    this.getDashboards=function () {
        var defer = $q.defer();
        $http.get('/api/v1/dashboards', {})
            .success(function (data, status, headers, config) {
                defer.resolve(data);
            })
            .error(function (data, status, headers, config) {
                defer.reject();
            });
        return defer.promise;
    };
    this.getEcdata=function(){
        var defer = $q.defer();
        $http.get('/api/datasources/', {})
            .success(function (data, status, headers, config) {
                defer.resolve(data);
            })
            .error(function (data, status, headers, config) {
                defer.reject();
            });
        return defer.promise;
    };
    this.createDash=function(data){
        var defer = $q.defer();
        $http.post('/api/datasources/', data)
            .success(function (data, status, headers, config) {
                defer.resolve(data);
            })
            .error(function (data, status, headers, config) {
                defer.reject();
            });
        return defer.promise;
    };
    this.deleteDash=function(id){
        var defer = $q.defer();
        $http.delete('/api/dashboards/'+id)
            .success(function (data, status, headers, config) {
                defer.resolve(data);
            })
            .error(function (data, status, headers, config) {
                defer.reject();
            });
        return defer.promise;
    }
}]);
// 2018 1 16
// 王玉梁
app.service("tableHeaderHelper", function () {
    // 用于表格header换行
    this.changeLine = function (str) {
        // 换行自段
        var arr = [
            '投决版',
            '投决板',
            '董事会版',
            '开发面积',
            '竣工开发',
            '已售面积'
        ];
        // 需要提前删除的字段
        var del = [
            '（亿元）$',
            '^权益前',
            '^权益后'
        ];
        if (typeof str == 'string') {
            // 删除需要提前删除的字段
            for (var j = 0; j < del.length; j++) {
                var delreg = new RegExp(del[j]);
                if (delreg.test(str)) {
                    // 将需要删除的字段设置为空
                    str = str.replace(delreg, '');
                }
            }
            for (var i = 0; i < arr.length; i++) {
                // 定义正则 匹配结尾字段添加换行
                var reg = new RegExp(arr[i] + '$');
                // 判断是否包含固定字符串
                if (reg.test(str)) {
                    // 判断字符串长度
                    if (str.length - arr[i].length >= 4) {
                        str = str.replace(reg, '<br>' + arr[i]);
                    }
                }
            }
            // console.log('str', str);
            return str;
        }
    }
});