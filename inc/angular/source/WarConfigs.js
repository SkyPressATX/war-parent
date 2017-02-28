var extend = angular.module('$warExtend');

extend.config([
    '$urlRouterProvider',
    '$locationProvider',
    '$urlMatcherFactoryProvider',
    function( $urlRouterProvider, $locationProvider, $urlMatcherFactoryProvider ){
        $urlMatcherFactoryProvider.strictMode(false);
        $locationProvider.html5Mode(true);
        $urlRouterProvider.otherwise('/'); // Default Location
    }
]);

extend.config([
    '$stateProvider',
    'warRoutesConstant',
    function( $stateProvider, warRoutesConstant ){
        _.forEach(warRoutesConstant, function(v,k){
            $stateProvider.state(k,v);
        });
    }
]);

angular.module('$warModule', [ '$warExtend' ]);
