var extend = angular.module("$warExtend",[
    'ui.router',
    'colorpicker.module',
    'wysiwyg.module',
    // 'bootstrap.fileField'
]);

extend.constant('warRoutesConstant', {});

extend.constant('$warObject', warObject);

extend.provider('$warRoutes', ['warRoutesConstant',function(warRoutesConstant){

    this.editRoute = function( name, route ){
        _.set( warRoutesConstant, name, route );
    };
    this.addRoute = function( name, route ){
        warRoutesConstant[name] = route;
    };
    this.$get = function(){
        return warRoutesConstant;
    }
}]);

extend.filter('safeHTML', ['$sce', function($sce) {
    return function(input) {
        if( String(input).match(/\<.*\>/) ) return $sce.trustAsHtml(input);
        // return $sce.trustAsHtml(input);
        return input;
    };
}])
.filter('firstCap', ['$filter', function($filter){
    return function(input, scope) {
        if (input!=null)
        input = input.toLowerCase();
        var inputArray = input.split(' ');
        var newArray = _.map(inputArray, function(n){
            return n.substring(0,1).toUpperCase()+n.substring(1);
        });
        return newArray.join(' ');
    }
}])
.filter('toSpace', ['$filter', function($filter){
    return function(input){
        if(input == null){ return ""; }
        var newVal = input.replace(/_/g,' ');
        return newVal;
    };
}])
.filter('capSpace', ['$filter', function($filter){
    return function(input){
        if(input == null){ return ""; }
        var newVal = input.replace(/([A-Z])/g,' $1');
        return newVal;
    };
}])
.filter('mysqlDate', ['$filter',function( $filter ){
  return function(text){
    var  tempdate= new Date(text.replace(/-/g,"/"));
    return $filter('date')(tempdate, "yyyy-MM-dd");
  }
}]);
