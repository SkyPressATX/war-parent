var extend = angular.module('$warExtend');

extend.config(['$warRoutesProvider','$warObject', function($warRoutesProvider,$warObject){
    $warRoutesProvider.addRoute('home', {
        url:"",
        abstract: true,
        views: {
            "header": {templateUrl: $warObject.warPath+"/inc/templates/header.html", controller: 'headerController'},
            "body": {template: '<div ui-view></div>'},
            "footer": {templateUrl: $warObject.warPath+"/inc/templates/footer.html", controller: 'footerController'},
        },
        resolve: {
            warOptions: ['$rootScope', '$apiCall', '$userRole', function($rootScope, $apiCall, $userRole){
                return $apiCall.get('/site-options').then(function( options ){
                    $rootScope.siteOptions = options.siteOptions;
                    $rootScope.themeOptions = options.themeOptions;
                    $rootScope.adminOptions = options.adminOptions;
                    if(options.siteOptions.currentUser){
                        $rootScope.isAdministrator = $userRole.boolRoleCheck('administrator'); //Set isAdministrator
                    }
                    return true;
                });
            }],
            warMenu: ['$rootScope', '$apiCall', '$userRole', function($rootScope, $apiCall, $userRole){
                return $apiCall.get('/menu').then(function(headerMenu){
                    $rootScope.headerMenu = headerMenu;
                    return true;
                });
            }]
        }
    });
    $warRoutesProvider.addRoute('main', {
        parent: 'home',
        url: '/',
        template: '<div class="m-x-auto m-t-3 p-t-3"><h4 class="text-xs-center">Temp Home Page <small><em>Edit Me</em></small></h4></div>'
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
