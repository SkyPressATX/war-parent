var extend = angular.module('$warExtend');

extend.config(['$warRoutesProvider','$warObject', function($warRoutesProvider,$warObject){

    var genericView = {
        "" :{
            templateUrl: $warObject.warPath+"/inc/templates/general.html",
            controller: "generalController"
        }
    };

    $warRoutesProvider.addRoute('home', {
        url:"",
        abstract: true,
        views: {
            "header": {templateUrl: $warObject.warPath+"/inc/templates/header.html", controller: 'headerController'},
            "body": {template: '<div ui-view></div>'},
            "footer": {templateUrl: $warObject.warPath+"/inc/templates/footer.html", controller: 'footerController'},
        },
        resolve: {
            warOptions: ['$rootScope', '$userRole', '$warClient', function($rootScope, $userRole, $warClient ){
                return $warClient.name( $warObject.api_namespace ).siteOptions.get()
                    .then(function( options ){
                        $rootScope.siteOptions = options.siteOptions;
                        $rootScope.themeOptions = options.themeOptions;
                        $rootScope.adminOptions = options.adminOptions;
                        if(options.siteOptions.currentUser){
                            $rootScope.isAdministrator = $userRole.boolRoleCheck('administrator'); //Set isAdministrator
                        }
                        return true;
                    })
                    .catch(function( err ){ console.log( err ); });
            }],
            warMenu: ['$rootScope', '$warClient', '$userRole', function($rootScope, $warClient, $userRole){
                return $warClient.name( $warObject.api_namespace ).menu.get()
                .then(function(headerMenu){
                    $rootScope.headerMenu = headerMenu;
                    return true;
                })
                .catch(function( err ){ console.log( err ); });
            }]
        }
    });
    $warRoutesProvider.addRoute('main', {
        parent: 'home',
        url: '/',
        resolve: {
            generalResolve: [ '$warClient', function( $warClient ){
                return $warClient.name( $warObject.api_namespace ).home.get()
                    .then( function( found ){
                        return found;
                    })
                    .catch( function( err ){
                        return { Error: err };
                    });
            }]
        },
        views: genericView
    });
    $warRoutesProvider.addRoute('login', {
        parent: 'home',
        url:"/login",
        views: {
            "" :{ template: '<war-login size="page"></war-login>' }
        }
    });
    $warRoutesProvider.addRoute('admin', {
        parent: 'home',
        url:"/admin",
        views: {
            "" :{
                templateUrl: $warObject.warPath+"/inc/templates/admin.html",
                controller: "adminController"
            }
        }
    });
    $warRoutesProvider.addRoute('adminOptions', {
        parent: 'admin',
        url:"/:uri",
        params: { option: {role: 'administrator'} },
        views: {
            "" :{
                templateUrl: adminOptionsTemplateFn,
                controllerProvider: adminOptionsControllerFn
            }
        }
    });

    $warRoutesProvider.addRoute('post', {
        parent: 'home',
        url: $warObject.permalink,
        resolve: {
            generalResolve: [ '$warClient', '$stateParams', function( $warClient, $stateParams ){
                return $warClient.name( 'wp/v2' ).posts.get( { slug: $stateParams.slug, '_embed': true } )
                    .then( function( found ){
                        return found[ 0 ]; //Should only be one
                    })
                    .catch( function( err ){
                        return { Error: err };
                    });
            }]
        },
        views: genericView
    });
    $warRoutesProvider.addRoute('page', {
        parent: 'home',
        url: '/:slug',
        resolve: {
            generalResolve: [ '$warClient', '$stateParams', function( $warClient, $stateParams ){
                return $warClient.name( 'wp/v2' ).pages.get( { slug: $stateParams.slug, '_embed': true } )
                    .then( function( found ){
                        return found[ 0 ];
                    })
                    .catch( function( err ){
                        return { Error: err };
                    });
            }]
        },
        views: genericView
    });

    adminOptionsTemplateFn.$inject = ['$stateParams'];
    adminOptionsControllerFn.$inject = ['$stateParams'];
    function adminOptionsTemplateFn($stateParams){
        if($stateParams.uri == 'wp-admin') return;
        return $warObject.warPath+"/inc/templates/"+$stateParams.uri+".html"
    };
    function adminOptionsControllerFn($stateParams){
        return _.camelCase($stateParams.uri+'Controller');
    };
}]);
