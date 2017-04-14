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
    '$warOrm',
    '$warObject',
    function( $rootScope, $warOrm, $warObject ){
        return {
            save: function(){
                var optionObject = {
                    'siteName':$rootScope.siteOptions.siteName,
                    'json':angular.toJson($rootScope.themeOptions)
                };
                return $warOrm.name( $warObject.api_namespace ).themeOptions.post( optionObject ).then(function(resp){
                    return true;
                }).catch(function(err){
                    return false;
                });
            }
        }
    }
]);

extend.service( '$warApiCall', [
	'$http',
	'$warObject',
	function( $http, $warObject ){
		var apiCall = function(method, url, params ){
			var httpConfig = {
				method: method,
				url: '/' + $warObject.api_prefix + url,
				headers: { 'X-WP-Nonce': $warObject.nonce }
			};
			if( params && method === 'GET' ) httpConfig.params = params;
			if( params && method !== 'GET' ) httpConfig.data = params;

			return $http( httpConfig ).then(function(r){
				return r.data;
			}).catch(function(err){
				return { error: err.statusText, data: err.data };
			});
		};

		this.get = function( url, params ){
			return apiCall( 'GET', url, params );
		};
        this.put = function( url, params ){
            return apiCall( 'PUT', url, params );
        };
		this.post = function( url, params ){
			return apiCall( 'POST', url, params );
		};
        this.patch = function( url, params ){
            return apiCall( 'PATCH', url, params );
        };
		this.delete = function( url, params ){
			return apiCall( 'DELETE', url, params );
		};
	}
]);

extend.service( '$warOrm', [
	'$warApiCall',
    '$warObject',
    '$q',
    function( $warApiCall, $warObject, $q ){

        // var that = this;
		this.routes = {};

		this.discover = function( ns ){
            var that = this;
			if( ! ns ) ns = '';

            if( ! _.isEmpty( that.routes ) ) return true;

			return $warApiCall.get( '/' + ns )
            .then( function( resp ){
				if( resp.routes ) return resp.routes;
				throw new Error( 'No Routes Found' );
			})
			.then( function( routes ){
				_.assign( that.routes, _.transform( routes, function( r, v, k ){
					if( v.namespace && v.namespace !== _.trimStart( k, '/' ) ){ // We don't want duplicate routes of the namespace
						if( ! r[ v.namespace ] ) r[ v.namespace ] = {};
                        var end = {};
                        _.each( v.methods, function( m ){
                            m = _.toLower( m );
                            end[ m ] = _.bind( $warApiCall[ m ], end, k );
                        } );

						r[ v.namespace ][ _.camelCase( _.replace( _.trimStart( k, '/' ), v.namespace + '/', '' ) ) ] = end;
					}
				}, {}) );
				return that.routes;
			})
			.catch( function( err ){
				console.log( err );
				return { 'error': err };
			});
		};

		this.name = function( ns ){
			if( ! _.isString( ns ) ) throw new Error( 'Namespace needs to be a string' );
            if( ! this.routes[ ns ] ) throw new Error( ns + ' Namespace not found' );
            return this.routes[ ns ];
		}

		this.list = function( ns ){
            if( _.isEmpty( this.routes ) ) throw new Error( 'Namespace not found' );
            if( ! _.isString( ns ) || ! ns ) return this.routes;
		    return this.routes[ ns ];
		}


	}
]);

extend.run( [ '$transitions', function( $transitions ){
    $transitions.onBefore( { }, function( trans ){
        var warOrm = trans.injector().get( '$warOrm' );
        return warOrm.discover();
    } );
}]);

// .factory('$apiCall', [
//     '$http',
//     '$q',
//     '$warObject',
//     function($http,$q,$warObject){
//         var apiCall = function(method, url, opt, append){
//             var namespace = '/' + $warObject.api_prefix + '/' + $warObject.api_namespace;
//             if(append === true) url = (namespace + url);
//             return $http({
//                 method: method,
//                 url: url,
//                 data: opt,
//                 headers: {'X-WP-Nonce': $warObject.nonce}
//             }).then(function(r){
//                 return r.data;
//             }).catch(function(err){
//                 return { error: err.statusText, data: err.data };
//             });
//         }
//
//         return {
//             getLocal : function(url){
//                 return apiCall('GET', url, null, false);
//             },
//             get : function(url){
//                 return apiCall('GET',url, null, true);
//             },
//             post : function(url,opt){
//                 return apiCall('POST',url, opt, true);
//             },
//             put : function(url, opt){
//                 return apiCall('PUT', url, opt, true);
//             },
//             delete : function(url){
//                 return apiCall('DELETE', url, null, true);
//             }
//         }
//     }
// ])
// .factory('$postData',[
//     '$apiCall',
//     '$warObject',
//     function($apiCall,$warObject){
//         var api_prefix = '/'+$warObject.api_prefix;
//         var getOne = function(slug,type){
//             return $apiCall.getLocal(api_prefix+'/wp/v2/'+type+'s?slug='+slug).then(function(resp){
//                 return resp[0];
//             }, function(err){ return {'error':err}; });
//         };
//         var getAll = function(type){
//             return $apiCall.getLocal(api_prefix+'/wp/v2/'+type+'s').then(function(resp){
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
