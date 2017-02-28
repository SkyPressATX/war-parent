var extend = angular.module('$warExtend');

extend.directive('compileTemplate', ['$compile','$parse',function($compile, $parse){
    return {
        link: function(scope, element, attr){
            var parsed = $parse(attr.ngBindHtml);
            function getStringValue() { return (parsed(scope) || '').toString(); }
            //Recompile if the template changes
            scope.$watch(getStringValue, function() {
                $compile(element, null, -9999)(scope);  //The -9999 makes it skip directives so that we do not recompile ourselves
            });
        }
    }
}]);

extend.directive('warLogin', ['$warObject',function($warObject){
    var loginController = [
        '$scope',
        '$rootScope',
        '$apiCall',
        '$state',
        function($scope, $rootScope, $apiCall, $state){
            $scope.currentUser = $rootScope.siteOptions.currentUser;
            $scope.loginAttempt = {username: null, password: null};
            $scope.loginCB = function(){
                if($scope.error) $scope.error = false;
                $apiCall.post('/login',$scope.loginAttempt).then(function(resp){
                    if(resp.error){
                        $scope.error = resp.error;
                    }else{
                        window.location.href = "/";
                    }
                });
            };
            $scope.logoutCB = function(){
                if($scope.error) $scope.error = false;
                $apiCall.get('/logout').then(function(resp){
                    if(resp.error){
                        $scope.error = resp.error;
                    }else{
                        window.location.href = "/";
                    }
                });
            }
        }
    ];

    return {
        restrict: "AE",
        replace: "true",
        templateUrl: function(elem, attr){
            return $warObject.warPath+"/inc/templates/login-"+attr.size+".html";
        },
        controller: loginController,
        scope: {
            font: "=",
        }
    };
}]);
