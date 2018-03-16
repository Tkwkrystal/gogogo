'use strict';
var app=angular.module('app.user', ['app.services','ngDialog']);
app.controller("userListController",['$scope','userHelper','ngDialog',function($scope,$userHelper,$ngDialog){
    $scope.chooseArr=[];
    var len;
    $scope.x=false;//默认未选中
    var promise=$userHelper.getUserList();
    promise.then(function(data){
        $scope.userItems=data;
        len=data.length;
    },function(data){
        console.log(data);
    });
    $scope.addUser=function(){
        $ngDialog.open({
            template: 'tpl/user/userAdd.html',
            controller:'userAddController',
            className: 'ngdialog-theme-default ngdialog-theme-custom',
            scope: $scope,
            showClose: true,
            closeByDocument: false, 
            closeByEscape: true,
            preCloseCallback:function(data){
                if(data){
                    $scope.userItems.push(data);
                }       
            }
        });
    };
    $scope.deleteUser=function(){

        var IDarr=new Array();
        for(var i=0;i<$scope.chooseArr.length;i++){
            if($scope.chooseArr[i].roleName=="super"){
                $scope.errMassage="无法删除超级管理员账户！";
                var dialog = $ngDialog.open({
                    template:
                        '  <div class="panel-heading">'+ $scope.errMassage +'  </div>' ,
                    plain: true,
                    showClose: true,
                });
            }
            IDarr.push($scope.chooseArr[i]._id);
        }
        var Q=$userHelper.userDelete(IDarr);
        Q.then(function(data){
            console.log(data);
        },function(data){
            console.log(data);
        })
        $scope.errMassage="删除成功！";
        var dialog = $ngDialog.open({
            template:
            '  <div class="panel-heading">'+ $scope.errMassage +'  </div>' ,
            plain: true,
            showClose: true,
        });
        window.location.reload();
    };
    $scope.chooseALL=function(users){
        if(document.getElementsByName('checkAll')[0].checked){
            var check=true;
        }else{
            var check=false;
        }
       if(check){
           $scope.chooseArr=angular.copy(users);           
           for(var a=0;a<len;a++){
                $(document.getElementsByName('check')[a]).prop("checked", true);
           }
       }else{
            $scope.chooseArr=[];
               for(var a=0;a<len;a++){
               $(document.getElementsByName('check')[a]).prop("checked", false);             
           }
       }
    };
    $scope.chooseOne=function(user,index){
        if(document.getElementsByName('check')[index].checked){
            var x=true;
        }else{
            var x=false;
        }
        if(x){
            $scope.chooseArr.push(user);
              if($scope.chooseArr.length==len){
                 $(  document.getElementsByName('checkAll')[0]).prop("checked", true);
                }
        }else{
            $scope.chooseArr.splice($scope.chooseArr.indexOf(user),1);//取消选中
        }
         if($scope.chooseArr.length<len){
             $(  document.getElementsByName('checkAll')[0]).prop("checked", false);
        };
    };
    $scope.editUser=function(){  
        if($scope.chooseArr.length!=1){
             $scope.errMassage="编辑用户时,请选择一条数据!";
            var dialog = $ngDialog.open({
                template:
                    '  <div class="panel-heading">'+ $scope.errMassage +'  </div>' ,
                plain: true,
                showClose: true,
            });
        }else{ 
             $ngDialog.open({
                template: 'tpl/user/userAdd.html',
                controller:'userAddController',
                className: 'ngdialog-theme-default ngdialog-theme-custom',
                scope: $scope,
                showClose: true,
                closeByDocument: false,
                closeByEscape: true,
                preCloseCallback:function(data){
                   $scope.chooseArr=[];
                    window.location.reload();
                }
            });
        }
    }
}]);
app.controller("userAddController",["$scope","userHelper","roleHelper","fileReader",'ngDialog',function($scope,$userHelper,$roleHelper,fileReader,$ngDialog){
    $scope.getFile = function () {
        fileReader.readAsDataUrl($scope.file, $scope)
            .then(function(result) {
                $scope.imageSrc = result;
            });
    };
    $scope.save=function(){
        if($scope.chooseArr&&$scope.chooseArr.length>0){
            var user={
                "email":$scope.user.email,
                "firstName":"514518",
                "lastName":"",
                "userName":$scope.user.userName ,
                "phone":$scope.user.phone,
                "roleId":$scope.user.roleId,
                "preferences":{"language":""},
                "password":$scope.user.password
            }
            $scope.userNameTest=!0;
            $scope.phoneTest=!0;
            $scope.emailTest=!0;
            var promise=$userHelper.userEdit(user,$scope.chooseArr[0]._id);
            promise.then(function(data){
                console.log(data);
                $scope.closeThisDialog($scope.user);
            },function(data){
                console.log(data);
            });
        }else{
             if( $scope.validateUser){

            }
            var promise=$userHelper.userAdd([$scope.user] );
            promise.then(function(data){
                console.log(data);
                $scope.closeThisDialog($scope.user);
            },function(data){
                console.log(data);
            });
            $scope.errMassage="新增成功！";
            var dialog = $ngDialog.open({
                template:
                '  <div class="panel-heading">'+ $scope.errMassage +'  </div>' ,
                plain: true,
                showClose: true,
                preCloseCallback:function(data){
              window.location.reload();
                }
            });

        }
    };
    var q=$roleHelper.getRolesList();
    q.then(function(data){
            console.log(data);
            for(var i=0;i<data.length;i++){
                switch (data[i].name){
                    case "super":data[i].name="超级管理员";break;
                    case "admin":data[i].name="管理员";break;
                    case "contributor":data[i].name="开发用户";break;
                    case "consumer":data[i].name="浏览用户";break;
                    default:break;
                }
            }
            $scope.roleList=data;
        },function(data){
            console.log(data);
        });
    $scope.cancer=function(){

    };
    $scope.user=$scope.chooseArr[0]||{};
    $scope.chooseArr[0]? ($scope.userNameTest=!0,$scope.phoneTest=!0,$scope.emailTest=!0):($scope.userNameTest=!1,$scope.phoneTest=!1,$scope.emailTest=!1);
    $scope.validateUser=!1;
    $scope.validateUserName=function(){
        if(!$scope.user.userName){ 
            $scope.userNameTest=!1; 
        } else{
            $scope.userNameTest=!0;          
        }
    };
    $scope.validatePhone=function(){
        if(!(/^1(3|4|5|7|8)\d{9}$/.test($scope.user.phone))){ 
            $scope.phoneTest=!1; 
        }else{
            $scope.phoneTest=!0;          
        }
    };
    $scope.validateEmail=function(){
        if(!(/^[A-Za-z\d]+([-_.][A-Za-z\d]+)*@([A-Za-z\d]+[-.])+[A-Za-z\d]{2,4}$/.test($scope.user.email))){ 
            $scope.emailTest=!1; 
        }else{
            $scope.emailTest=!0;          
        }
    };	
    $scope.validatePWD=function(){
        if($scope.showPWD){
            if(!(/^(?![a-zA-Z0-9]+$)(?![^a-zA-Z/D]+$)(?![^0-9/D]+$).{8,20}$/.test($scope.user.password))){
                $scope.PWDTest=!1;
            }else{
                $scope.PWDTest=!0;
            }
        }
        //$scope.PWDTest=!0;
    }
}]);
app.controller("userGroupController",["$scope","userHelper","ngDialog",function($scope,$userHelper,$ngDialog){
    var len;$scope.chooseArr=[];
    var promise=$userHelper.userGroupList();
    promise.then(function(data){
        $scope.userGroupItems=data;
        len=data.length;
    },function(data){
        console.log(data);
    });    
    $scope.addGroup=function(){
        $ngDialog.open({
            template: 'tpl/user/userGroupAdd.html',
            controller:'userGroupAddController',
            className: 'ngdialog-theme-default ngdialog-theme-custom',
            scope: $scope,
            showClose: true,
            closeByDocument: false,
            closeByEscape: true,
            preCloseCallback:function(data){
                if(data){
                    $scope.userGroupItems.push(data);
                }
              }
        });
    };
    $scope.chooseALL=function(userGroups){
        if(document.getElementsByName('checkAll')[0].checked){
            var check=true;
        }else{
            var check=false;
        }
       if(check){
           $scope.chooseArr=angular.copy(userGroups);           
           for(var a=0;a<len;a++){
                $(document.getElementsByName('check')[a]).prop("checked", true);
           }
       }else{
            $scope.chooseArr=[];
               for(var a=0;a<len;a++){
               $(document.getElementsByName('check')[a]).prop("checked", false);             
           }
       }
    };
    $scope.chooseOne=function(userGroups,index){
        if(document.getElementsByName('check')[index].checked){
            var x=true;
        }else{
            var x=false;
        }
        if(x){
            $scope.chooseArr.push(userGroups);
              if($scope.chooseArr.length==len){
                 $(  document.getElementsByName('checkAll')[0]).prop("checked", true);
                }
        }else{
            $scope.chooseArr.splice($scope.chooseArr.indexOf(userGroups),1);//取消选中
        }
         if($scope.chooseArr.length<len){
             $(  document.getElementsByName('checkAll')[0]).prop("checked", false);
        };
    };
    $scope.userGroupEdit=function(){
        if($scope.chooseArr.length!=1){
            $scope.errMassage="编辑用户组时,请选择一条数据!";
            var dialog = $ngDialog.open({
                template:
                    '  <div class="panel-heading">'+ $scope.errMassage +'  </div>' ,
                plain: true,
                showClose: true,
            });
        }else{
            // console.log($scope.chooseArr[0]._id);
            // var S = $userHelper.userGroupUser($scope.chooseArr[0]._id);
            // console.log(S);
            // S.then(function (data) {
            //     console.log(data)
            //     $scope.userGroup=data;
            //
            //
            // });
             $ngDialog.open({
                template: 'tpl/user/userGroupAdd.html',
                controller:'userGroupAddController',
                className: 'ngdialog-theme-default ngdialog-theme-custom',
                scope: $scope,
                showClose: true,
                closeByDocument: false,
                closeByEscape: true,
                preCloseCallback:function(data){
                   $scope.chooseArr=[];
                   console.log($scope.userGroup);
                    window.location.reload();

                }
            });


        }
    };
    $scope.deleteGroup=function(){
        var UGs={
            "deleteAdUsers": false,
            "groups":[]
        };
        for(var i=0;i<$scope.chooseArr.length;i++){
            if($scope.chooseArr[i].name=="admin"||$scope.chooseArr[i].name=="everyone"){
                $scope.errMassage="无法删除内置分组！";
                var dialog = $ngDialog.open({
                    template:
                        '  <div class="panel-heading">'+ $scope.errMassage +'  </div>' ,
                    plain: true,
                    showClose: true,
                });
            }
            $scope.userGroupItems.splice( $scope.userGroupItems.indexOf($scope.chooseArr[i]),1);
            UGs.groups.push($scope.chooseArr[i]._id);
        }
         $.ajax({
            type: "delete",
                url: "/api/groups",
            contentType: 'application/json',
            data: JSON.stringify(UGs),
            success: function (data, status) {
                $scope.errMassage="删除成功！";
                var dialog = $ngDialog.open({
                    template:
                    '  <div class="panel-heading">'+ $scope.errMassage +'  </div>' ,
                    plain: true,
                    showClose: true,
                });

            }
        });
    };
}]);
app.controller('userGroupAddController',["$scope","userHelper","$rootScope",function($scope,$userHelper,$rootScope){
    function containerArr(arr,e){
        for(var i=0;i<arr.length;i++)
        {
            if(arr[i]._id== e._id)
                return true;
        }
        return false;
    }
    var val=[];
//数组，相同数组名，提取物1，提取物2，判断条件
    var getVal=function(arr,node,title,url,must){
        for(var x=0;x<arr.length;x++){
            if(arr[x][must]*1===1)val.push({title:arr[x][title],url:arr[x][url]});
            try{getVal(arr[x][node],node,title,url,must)}catch(err){}
        }
    }
    getVal($rootScope.navTree.treeNodes.slice(1),"nodes","title","url","nav_type");
    $scope.navTrees= val;

    console.log($scope.navTrees);
    $scope.userGroup= $scope.chooseArr[0]||{};
    $scope.userGroupNameTest=$scope.chooseArr[0]?true:false;
    // if($scope.userGroup.length>0){
        console.log($scope.userGroup);

    for (var i=0;i<$scope.navTrees.length;i++){
        if($scope.userGroup.pageIndex==$scope.navTrees[i].url){
            $scope.userGroupPageIndex=$scope.navTrees[i];

        }
    }
    // $scope.userGroupPageIndex=$scope.navTrees[0];
    console.log($scope.navTrees);
        var S=$userHelper.userGroupUser($scope.userGroup._id);
        S.then(function(data){
            $scope.usersGroup=data;
        },function(data){
            $scope.usersGroup=data;
            console.log(data);
        })
    // }
    // $scope.usersGroup=[];
    $scope.save=function(){
        if($scope.chooseArr&&$scope.chooseArr.length>0){
            var data={
                "name":$scope.userGroup.name,
                "defaultRole":"",
                "language":"",
                "pageIndex":$scope.userGroupPageIndex.url
            };
            var Q=$userHelper.userGroupEdit(data,$scope.chooseArr[0]._id);
            Q.then(function(data){
                if($scope.usersGroup){
                    var idArr=new Array();
                    if($scope.usersGroup&&$scope.usersGroup.length>0){
                        $.each($scope.usersGroup,function(index,item){
                            idArr.push(item._id);
                        })
                        var req=$userHelper.userGroupUserPush($scope.chooseArr[0]._id,idArr);
                        req.then(function(res){
                                $scope.userGroup.usersCount=$scope.usersGroup.length;
                                $scope.closeThisDialog($scope.userGroup);
                            },
                            function(res){
                                $scope.userGroup.usersCount=0;
                                $scope.closeThisDialog($scope.userGroup);
                            });
                    }else{
                        $scope.userGroup.usersCount=0;
                        $scope.closeThisDialog($scope.userGroup);
                    }

                }
             },function(data){
                 console.log(data);
            })
        }else{
            var data=[{
                "name":$scope.userGroup.name,
                "defaultRole":"",
                "language":"",
                "pageIndex":$scope.userGroupPageIndex.url
            }];
            var Q=$userHelper.userGroupAdd(data);
            Q.then(function(data){
                if($scope.usersGroup){
                    var idArr=new Array();
                    if($scope.usersGroup&&$scope.usersGroup.length>0){
                        $.each($scope.usersGroup,function(index,item){
                            idArr.push(item._id);
                        })
                        var req=$userHelper.userGroupUserPush(data[0][0]._id,idArr);
                        req.then(function(res){
                                $scope.userGroup.usersCount=$scope.usersGroup.length;
                                $scope.closeThisDialog($scope.userGroup);
                            },
                            function(res){
                                $scope.userGroup.usersCount=0;
                                $scope.closeThisDialog($scope.userGroup);
                            });
                    }else{
                        $scope.userGroup.usersCount=0;
                        $scope.closeThisDialog($scope.userGroup);
                    }

                }

             },function(data){
                 console.log(data);
            })
        }
    };
    $scope.validateuserGroup=function(){
        if($scope.userGroup.name){
            $scope.userGroupNameTest=!0;
        }else{
             $scope.userGroupNameTest=!1;
        }
    };
    $scope.$watch('searchUser',function(){
        if($scope.searchUser){
                var Q=$userHelper.userSearch($scope.searchUser);
                Q.then(function(data){
                    $scope.searchUserLists=data;
                },function(data){
                    console.log(data);
                })
        }
    });
    $scope.pushUserGroup=function(usetItem){
        if(!containerArr($scope.usersGroup,usetItem)){
            $scope.usersGroup.push(usetItem);
        }
        $scope.searchUserLists=[];
        $scope.searchUser=null;
    }
}])