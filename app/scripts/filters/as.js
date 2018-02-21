angular
  .module('AppWeb')
  .filter('as', as);

as.$inject = ['$parse'];

function as ($parse) {    
  return function(value, context, path) {
   return $parse(path).assign(context, value);
  };
}

