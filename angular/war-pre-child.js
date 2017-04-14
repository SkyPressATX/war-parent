/** War Extend Init **/
var extend=angular.module("$warExtend",["ui.router","colorpicker.module","wysiwyg.module"]);extend.constant("warRoutesConstant",{}),extend.constant("$warObject",warObject),extend.provider("$warRoutes",["warRoutesConstant",function(t){this.editRoute=function(e,n){_.set(t,e,n)},this.addRoute=function(e,n){t[e]=n},this.$get=function(){return t}}]),extend.filter("safeHTML",["$sce",function(t){return function(e){return String(e).match(/\<.*\>/)?t.trustAsHtml(e):e}}]).filter("firstCap",["$filter",function(t){return function(t,e){null!=t&&(t=t.toLowerCase());var n=t.split(" "),r=_.map(n,function(t){return t.substring(0,1).toUpperCase()+t.substring(1)});return r.join(" ")}}]).filter("toSpace",["$filter",function(t){return function(t){if(null==t)return"";var e=t.replace(/_/g," ");return e}}]).filter("capSpace",["$filter",function(t){return function(t){if(null==t)return"";var e=t.replace(/([A-Z])/g," $1");return e}}]).filter("mysqlDate",["$filter",function(t){return function(e){var n=new Date(e.replace(/-/g,"/"));return t("date")(n,"yyyy-MM-dd")}}]);


/** War Routes **/
// extend.config(["$warRoutesProvider","$warObject",function(e,t){function r(e){if("wp-admin"!=e.uri)return t.warPath+"/inc/templates/"+e.uri+".html"}function o(e){return _.camelCase(e.uri+"Controller")}e.addRoute("home",{url:"",abstract:!0,views:{header:{templateUrl:t.warPath+"/inc/templates/header.html",controller:"headerController"},body:{template:"<div ui-view></div>"},footer:{templateUrl:t.warPath+"/inc/templates/footer.html",controller:"footerController"}},resolve:{warOptions:["$rootScope","$apiCall","$userRole",function(e,t,r){return t.get("/site-options").then(function(t){return e.siteOptions=t.siteOptions,e.themeOptions=t.themeOptions,t.siteOptions.currentUser&&(e.isAdministrator=r.boolRoleCheck("administrator")),!0})}],warMenu:["$rootScope","$apiCall","$userRole",function(e,t,r){return t.get("/menu").then(function(t){return e.headerMenu=t,!0})}]}}),e.addRoute("main",{parent:"home",url:"/",template:'<div class="m-x-auto m-t-3 p-t-3"><h4 class="text-xs-center">Temp Home Page <small><em>Edit Me</em></small></h4></div>'}),e.addRoute("login",{parent:"home",url:"/login",views:{"":{template:'<war-login size="page"></war-login>'}}}),e.addRoute("admin",{parent:"home",url:"/admin",views:{"":{templateUrl:t.warPath+"/inc/templates/admin.html",controller:"adminController"}}}),e.addRoute("adminOptions",{parent:"admin",url:"/:uri",params:{option:{role:"administrator"}},views:{"":{templateUrl:r,controllerProvider:o}}}),r.$inject=["$stateParams"],o.$inject=["$stateParams"]}]);
extend.config(['$warRoutesProvider','$warObject', function($warRoutesProvider,$warObject ){
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
        resolve: {
			pageResolve: ['$apiCall','$stateParams',function($apiCall,$stateParams){
                return $apiCall.getLocal( '/wp/v2/pages?slug=home' ).then( function( res ){
                    return res;
                }, function( err ){ return err; });
			}]
		},
        views: {
            "": {
                templateUrl: $warObject.warPath+"/inc/templates/page.html",
                controller: 'pageController' },
        }
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
    $warRoutesProvider.addRoute( 'wpAdmin', {
        parent: 'home',
        url: '/wp-admin',
        views: {
            "": {
                template: '<div></div>',
                controller: 'wpAdminController'
            }
        }
    })
    $warRoutesProvider.addRoute('adminOptions', {
        parent: 'admin',
        url:"/:uri",
        params: { option: {role: 'administrator'} },
        views: {
            "" :{
				templateProvider: [ 'warOptions', '$templateRequest', '$rootScope', '$stateParams', function( warOptions, $templateRequest, $rootScope, $stateParams ){
                    if( warOptions ){
                        if( $stateParams.uri == 'wp-admin' ) return;
                        var a = _.find( $rootScope.adminOptions, [ 'uri', $stateParams.uri ] );
                        if( a.template ) return $templateRequest( $warObject.childPath + a.template );
                        return $templateRequest( $warObject.warPath+"/inc/templates/"+$stateParams.uri+".html" );
                    }
				}],
                controllerProvider: adminOptionsControllerFn
            }
        }
    });
    $warRoutesProvider.addRoute('page',{
        parent: 'home',
        url: "/:slug",
        resolve: {
            pageResolve: ['$postData','$stateParams',function($postData,$stateParams){
                return $postData.getOne($stateParams.slug,'page');
            }]
        },
        views: {
            "": {
                templateUrl: $warObject.warPath+"/inc/templates/page.html",
                controller: 'pageController'
            }
        }
    });
    $warRoutesProvider.addRoute('post',{
        parent: 'home',
        url: $warObject.permalink,
        resolve: {
            postResolve: ['$postData','$stateParams',function($postData,$stateParams){
                return $postData.getOne($stateParams.slug,'post').then(function(post){
                    if(! post){
                        return $postData.getOne($stateParams.slug,'page')
                    }else{
                        return post;
                    }
                });
            }]
        },
        views: {
            "":{
                templateUrl: $warObject.warPath+"/inc/templates/post.html",
                controller: "postController"
            }
        }
    });

    adminOptionsTemplateFn.$inject = ['$stateParams'];
    adminOptionsControllerFn.$inject = ['$stateParams'];
    function adminOptionsTemplateFn($stateParams){
        if($stateParams.uri == 'wp-admin') return;
		if( $stateParams.option.template ) return $warObject.childPath + $stateParams.option.template;
        return $warObject.warPath+"/inc/templates/"+$stateParams.uri+".html"
    };
    function adminOptionsControllerFn($stateParams){
        return _.camelCase($stateParams.uri+'Controller');
    };
}]);
