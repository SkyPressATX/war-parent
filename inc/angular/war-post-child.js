var extend=angular.module("$warExtend");

/** War Config **/
extend.config(["$urlRouterProvider","$locationProvider","$urlMatcherFactoryProvider",function(o,t,e){e.strictMode(!1),t.html5Mode(!0),o.otherwise("/")}]),extend.config(["$stateProvider","warRoutesConstant",function(o,t){_.forEach(t,function(t,e){o.state(e,t)})}]),angular.module("$warModule",["$warExtend"]);
// var extend = angular.module("$warExtend");

extend.controller('adminController', [
    '$scope',
    '$userRole',
	'$rootScope',
    function($scope, $userRole, $rootScope ){
        $scope.userRole = $userRole.checkRole;
        $scope.adminOptions = $rootScope.adminOptions;
    }
])
.controller( 'postController', [
    '$scope',
    'postResolve',
    function( $scope, postResolve ){
        $scope.post = postResolve;
    }
])
.controller( 'pageController', [
    '$scope',
    'pageResolve',
    function( $scope, pageResolve ){
        $scope.page = pageResolve;
    }
])
.controller('wpAdminController',[
    function(){
        window.location.href = "/wp-admin/";
    }
])
.controller('themeOptionsController',[
    '$scope',
    '$rootScope',
    '$themeOptions',
    '$userRole',
    '$stateParams',
    function($scope, $rootScope, $themeOptions, $userRole, $stateParams){
        $scope.roleCheck = $userRole.checkRole( $stateParams.option.role );
        if(! $rootScope.themeOptions.footerLinks) $rootScope.themeOptions.footerLinks = {
            'twitter':{
                'logo': 'ion-social-twitter',
                'url': '//twitter.com/'
            },
            'facebook':{
                'logo': 'ion-social-facebook',
                'url': '//facebook.com/'
            }
        };

        $scope.saveOptions = function(){
            $scope.saved = undefined;
            $themeOptions.save().then(function(resp){ $scope.saved = resp; });
        }
    }
])
.controller('headerController',[
    '$scope',
    function($scope){ }
])
.controller('footerController',[
    '$scope',
    function($scope){ }
]);

/** War Controller **/
// extend.controller("adminController",["$scope","$userRole",function(o,e){o.userRole=e.checkRole,o.adminOptions=[{title:"Theme Options",role:"administrator",uri:"theme-options"},{title:"WP Admin",role:"administrator",uri:"wp-admin"}]}]).controller("wpAdminController",[function(){window.location.href="/wp-admin/"}]).controller("themeOptionsController",["$scope","$rootScope","$themeOptions","$userRole","$stateParams",function(o,e,t,n,r){o.roleCheck=n.checkRole(r.option.role),e.themeOptions.footerLinks||(e.themeOptions.footerLinks={twitter:{logo:"ion-social-twitter",url:"//twitter.com/"},facebook:{logo:"ion-social-facebook",url:"//facebook.com/"}}),o.saveOptions=function(){o.saved=void 0,t.save().then(function(e){o.saved=e})}}]).controller("headerController",["$scope",function(o){}]).controller("footerController",["$scope",function(o){}]);

/** War Directives **/
extend.directive("compileTemplate",["$compile","$parse",function(r,t){return{link:function(e,n,o){function i(){return(l(e)||"").toString()}var l=t(o.ngBindHtml);e.$watch(i,function(){r(n,null,-9999)(e)})}}}]),extend.directive("warLogin",["$warObject",function(r){var t=["$scope","$rootScope","$apiCall","$state",function(r,t,e,n){r.currentUser=t.siteOptions.currentUser,r.loginAttempt={username:null,password:null},r.loginCB=function(){r.error&&(r.error=!1),e.post("/login",r.loginAttempt).then(function(t){t.error?r.error=t.error:window.location.href="/"})},r.logoutCB=function(){r.error&&(r.error=!1),e.get("/logout").then(function(t){t.error?r.error=t.error:window.location.href="/"})}}];return{restrict:"AE",replace:"true",templateUrl:function(t,e){return r.warPath+"/inc/templates/login-"+e.size+".html"},controller:t,scope:{font:"="}}}]);

/** War Factories **/
// extend.factory("$userRole",["$rootScope","$location",function(t,n){return{checkRole:function(e){if(t.siteOptions.currentUserRole&&"administrator"===t.siteOptions.currentUserRole)return!0;t.siteOptions.currentUserCaps||n.path("/");var r=_.find(_.keys(t.siteOptions.currentUserCaps),function(t){return t===e});return void 0===r&&n.path("/"),!0},boolRoleCheck:function(n){return _.find(t.siteOptions.currentUserCaps,function(t){return t===n})}}}]).factory("$themeOptions",["$rootScope","$apiCall","$q",function(t,n,e){return{save:function(){var e={siteName:t.siteOptions.siteName,json:angular.toJson(t.themeOptions)};return n.post("/theme-options",e).then(function(t){return!0}).catch(function(t){return!1})}}}]).factory("$apiCall",["$http","$q","$warObject",function(t,n,e){var r=function(n,r,o,u){var i="/"+e.api_prefix+"/"+e.api_namespace;return u===!0&&(r=i+r),t({method:n,url:r,data:o,headers:{"X-WP-Nonce":e.nonce}}).then(function(t){return t.data}).catch(function(t){return{error:t.statusText,data:t.data}})};return{getLocal:function(t){return r("GET",t,null,!1)},get:function(t){return r("GET",t,null,!0)},post:function(t,n){return r("POST",t,n,!0)},put:function(t,n){return r("PUT",t,n,!0)},delete:function(t){return r("DELETE",t,null,!0)}}}]);
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
            var prefix = '/' + $warObject.api_prefix;
            var namespace = '/' + $warObject.api_namespace;

            if(append === true) url = ( namespace + url );

            return $http({
                method: method,
                url: prefix + url,
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
// .factory('$postData',[
//     '$apiCall',
//     '$warObject',
//     function($apiCall,$warObject){
//         var getOne = function(slug,type){
//             return $apiCall.getLocal('/wp/v2/'+type+'s?slug='+slug).then(function(resp){
//                 return resp[0];
//             }, function(err){ return {'error':err}; });
//         };
//         var getAll = function(type){
//             return $apiCall.getLocal('/wp/v2/'+type+'s').then(function(resp){
//                 return resp;
//             }, function(err){ return {'error':err}; });
//         };
//
//         return {
//             getOne: function(slug,type){
//                 return getOne(slug,type).then(function(resp){
//                     return resp;
//                 });
//             },
//             getAll: function(type){
//                 return getAll(type).then(function(resp){ return resp; });
//             }
//         }
//     }
// ]);
