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
    '$warClient',
    '$warObject',
    function( $rootScope, $warClient, $warObject ){
        return {
            save: function(){
                var optionObject = {
                    'siteName':$rootScope.siteOptions.siteName,
                    'json':angular.toJson($rootScope.themeOptions)
                };
                return $warClient.name( $warObject.api_namespace ).themeOptions.post( optionObject ).then(function(resp){
                    return true;
                }).catch(function(err){
                    return false;
                });
            }
        }
    }
]);

// Looking for the old $warClient code?
// I made it into it's own module. Look at the directory war-parent/inc/lib/warApiClient.js
// ^_^

extend.run( [ '$transitions', function( $transitions ){
    $transitions.onBefore( { }, function( trans ){
        var warClient = trans.injector().get( '$warClient' );
        return warClient.discover();
    } );
}]);
