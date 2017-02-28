var extend = angular.module('$warExtend');

extend.factory('$userRole',[
    '$rootScope',
    '$location',
    function($rootScope,$location){
        return {
            checkRole: function(role){
                if( $rootScope.siteOptions.currentUserRole && $rootScope.siteOptions.currentUserRole === 'administrator' ) return true;
                if(! $rootScope.siteOptions.currentUserCaps) $location.path('/');
                var found = _.find( _.keys( $rootScope.siteOptions.currentUserCaps ), function( cap ){
                    return cap === role;
                } );
                if( found === undefined ) $location.path('/');
                return true;
            },
            boolRoleCheck: function(r){
                return _.find($rootScope.siteOptions.currentUserCaps, function(role){ return role === r; });
            }
        }
    }
])
.factory('$themeOptions',[
    '$rootScope',
    '$apiCall',
    '$q',
    function( $rootScope, $apiCall, $q ){
        return {
            save: function(){
                var optionObject = {
                    'siteName':$rootScope.siteOptions.siteName,
                    'json':angular.toJson($rootScope.themeOptions)
                };
                return $apiCall.post('/theme-options',optionObject).then(function(resp){
                    return true;
                }).catch(function(err){
                    return false;
                });
            }
        }
    }
])
.factory('$apiCall', [
    '$http',
    '$q',
    '$warObject',
    function($http,$q,$warObject){
        var apiCall = function(method, url, opt, append){
            var namespace = '/' + $warObject.api_prefix + '/' + $warObject.api_namespace;
            if(append === true) url = (namespace + url);
            return $http({
                method: method,
                url: url,
                data: opt,
                headers: {'X-WP-Nonce': $warObject.nonce}
            }).then(function(r){
                return r.data;
            }).catch(function(err){
                return { error: err.statusText, data: err.data };
            });
        }

        return {
            getLocal : function(url){
                return apiCall('GET', url, null, false);
            },
            get : function(url){
                return apiCall('GET',url, null, true);
            },
            post : function(url,opt){
                return apiCall('POST',url, opt, true);
            },
            put : function(url, opt){
                return apiCall('PUT', url, opt, true);
            },
            delete : function(url){
                return apiCall('DELETE', url, null, true);
            }
        }
    }
])
.factory('$postData',[
    '$apiCall',
    '$warObject',
    function($apiCall,$warObject){
        var api_prefix = '/'+$warObject.api_prefix;
        var getOne = function(slug,type){
            return $apiCall.getLocal(api_prefix+'/wp/v2/'+type+'s?slug='+slug).then(function(resp){
                return resp[0];
            }, function(err){ return {'error':err}; });
        };
        var getAll = function(type){
            return $apiCall.getLocal(api_prefix+'/wp/v2/'+type+'s').then(function(resp){
                return resp;
            }, function(err){ return {'error':err}; });
        };

        return {
            getOne: function(slug,type){
                return getOne(slug,type).then(function(resp){
                    return resp;
                });
            },
            getAll: function(type){
                return getAll(type).then(function(resp){ return resp; });
            }
        }
    }
]);
