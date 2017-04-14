var extend = angular.module("$warExtend");

extend.controller('adminController', [
    '$scope',
    '$rootScope',
    '$userRole',
    function($scope, $rootScope, $userRole){
        $scope.userRole = $userRole.checkRole;
        $scope.adminOptions = [
            {'title':'Theme Options','role':'administrator','uri':'theme-options'},
            {'title':'WP Admin','role':'administrator','uri':'wp-admin'}
        ];
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
