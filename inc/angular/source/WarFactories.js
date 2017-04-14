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

extend.service( '$warClient', [
	'$warApiCall',
    '$warObject',
    function( $warApiCall, $warObject ){
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
		};
		this.list = function( ns ){
            if( _.isEmpty( this.routes ) ) throw new Error( 'Namespace not found' );
            if( ! _.isString( ns ) || ! ns ) return this.routes;
		    return this.routes[ ns ];
		};
	}
]);

extend.run( [ '$transitions', function( $transitions ){
    $transitions.onBefore( { }, function( trans ){
        var warClient = trans.injector().get( '$warClient' );
        return warClient.discover();
    } );
}]);
