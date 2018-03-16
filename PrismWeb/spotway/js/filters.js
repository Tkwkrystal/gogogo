'use strict';

/* Filters */
// need load the moment.js to use this filter. 
var app=angular.module('app.filters', ['pascalprecht.translate']);
app.filter("T", ['$translate', function($translate) {  
    return function(key) {  
        if(key){  
            return $translate.instant(key);  
        }  
    };  
}]);  