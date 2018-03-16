/**
 * Created by a1 on 2018/3/5.
 */
'use strict';
var app = angular.module('pingAnServices', []);
app.service("yueBaoDataServices", ["$q", "$http", function($q, $http) {
    this.getData = function(jaql, add) {
        var defer = $q.defer();
        $http.post('/api/datasources/' + encodeURI(add) + '/jaql', jaql)
            .success(function(data, status, headers, config) {
                defer.resolve(data);
            })
            .error(function(data, status, headers, config) {
                defer.reject();
            });
        return defer.promise;
    }
}]);

app.factory('yuebaoXiangmugailanFactory', function () {

    var yuebaoXiangmugaiConfig = {
        "address": "平安不动产综合数据分析平台",
        "haiwaidangnian": {
            "datasource": {
                "fullname": "LocalHost/平安不动产综合数据分析平台",
            },
            "metadata": [{
                "jaql": {
                    "table": "首页",
                    "column": "项目名称",
                    "dim": "[首页.项目名称]",
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
                "disabled": false,
                "field": {
                    "id": "[首页.项目名称]",
                    "index": 0
                },
                "panel": "rows"
            }, {
                "jaql": {
                    "table": "维度表_项目立项",
                    "column": "项目所在地图中经度值",
                    "dim": "[维度表_项目立项.项目所在地图中经度值]",
                    "datatype": "numeric",
                    "title": "项目所在地图中经度值"
                },
                "format": {
                    "color": {
                        "type": "color",
                        "color": "transparent"
                    }
                },
                "field": {
                    "id": "[维度表_项目立项.项目所在地图中经度值]",
                    "index": 1
                },
                "disabled": false,
                "panel": "rows"
            }, {
                "jaql": {
                    "table": "维度表_项目立项",
                    "column": "项目所在地图中纬度值",
                    "dim": "[维度表_项目立项.项目所在地图中纬度值]",
                    "datatype": "numeric",
                    "title": "项目所在地图中纬度值"
                },
                "format": {
                    "color": {
                        "type": "color",
                        "color": "transparent"
                    }
                },
                "field": {
                    "id": "[维度表_项目立项.项目所在地图中纬度值]",
                    "index": 2
                },
                "disabled": false,
                "panel": "rows"
            }, {
                "jaql": {
                    "type": "measure",
                    "formula": "sum([E09F6-064])",
                    "context": {
                        "[E09F6-064]": {
                            "table": "首页",
                            "column": "当年累投",
                            "dim": "[首页.当年累投]",
                            "datatype": "numeric",
                            "title": "当年累投"
                        }
                    },
                    "title": "当年累投"
                },
                "format": {
                    "mask": {
                        "type": "number",
                        "t": true,
                        "b": true,
                        "separated": true,
                        "decimals": "auto",
                        "isdefault": true
                    },
                    "color": {
                        "type": "color",
                        "color": "transparent"
                    }
                },
                "field": {
                    "id": "sum([E09F6-064])",
                    "index": 4
                },
                "panel": "measures"
            }, {
                "jaql": {
                    "table": "首页",
                    "column": "事业部",
                    "dim": "[首页.事业部]",
                    "datatype": "text",
                    "merged": true,
                    "title": "事业部",
                    "filter": {
                        "explicit": true,
                        "multiSelection": false,
                        "members": ["策略及海外事业部"]
                    },
                    "collapsed": false
                },
                "disabled": false,
                "panel": "scope"
            }],
        },
        "haiwaileiji": {
            "datasource": {
                "fullname": "LocalHost/平安不动产综合数据分析平台",
            },
            "metadata": [{
                "jaql": {
                    "table": "首页",
                    "column": "项目名称",
                    "dim": "[首页.项目名称]",
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
                "disabled": false,
                "field": {
                    "id": "[首页.项目名称]",
                    "index": 0
                },
                "panel": "rows"
            }, {
                "jaql": {
                    "table": "维度表_项目立项",
                    "column": "项目所在地图中经度值",
                    "dim": "[维度表_项目立项.项目所在地图中经度值]",
                    "datatype": "numeric",
                    "title": "项目所在地图中经度值"
                },
                "format": {
                    "color": {
                        "type": "color",
                        "color": "transparent"
                    }
                },
                "field": {
                    "id": "[维度表_项目立项.项目所在地图中经度值]",
                    "index": 1
                },
                "disabled": false,
                "panel": "rows"
            }, {
                "jaql": {
                    "table": "维度表_项目立项",
                    "column": "项目所在地图中纬度值",
                    "dim": "[维度表_项目立项.项目所在地图中纬度值]",
                    "datatype": "numeric",
                    "title": "项目所在地图中纬度值"
                },
                "format": {
                    "color": {
                        "type": "color",
                        "color": "transparent"
                    }
                },
                "field": {
                    "id": "[维度表_项目立项.项目所在地图中纬度值]",
                    "index": 2
                },
                "disabled": false,
                "panel": "rows"
            }, {
                "jaql": {
                    "type": "measure",
                    "formula": "sum([7E518-64B])",
                    "context": {
                        "[7E518-64B]": {
                            "table": "首页",
                            "column": "累计投资",
                            "dim": "[首页.累计投资]",
                            "datatype": "numeric",
                            "title": "累计投资"
                        }
                    },
                    "title": "累计投资"
                },
                "format": {
                    "mask": {
                        "type": "number",
                        "t": true,
                        "b": true,
                        "separated": true,
                        "decimals": "auto",
                        "isdefault": true
                    },
                    "color": {
                        "type": "color",
                        "color": "transparent"
                    }
                },
                "field": {
                    "id": "sum([7E518-64B])",
                    "index": 3
                },
                "disabled": false,
                "panel": "measures"
            }, {
                "jaql": {
                    "table": "首页",
                    "column": "事业部",
                    "dim": "[首页.事业部]",
                    "datatype": "text",
                    "merged": true,
                    "title": "事业部",
                    "filter": {
                        "explicit": true,
                        "multiSelection": false,
                        "members": ["策略及海外事业部"]
                    },
                    "collapsed": false
                },
                "disabled": false,
                "panel": "scope"
            }],
        }


    }
    return yuebaoXiangmugaiConfig;
});