'use strict';

angular
  .module('AppWeb')
  .factory('errorInterceptor', errorInterceptor);

errorInterceptor.$inject = ['$location', '$q', 'Constant', 'User', '$injector'];

function errorInterceptor ($location, $q, Constant, User, $injector) {
  return {
    response: function (response) {
      var deferred = $q.defer();

      deferred.resolve(response);

      return deferred.promise;
    },
    responseError: function (resp) {

      switch(resp.status) {
        case 404:

          //not redirect to error-page if -- API get error
          if (angular.isString(resp.config.url) && Constant.API && resp.config.url.indexOf(Constant.API) !== -1 ) {
            return $q.reject(resp);
          } else
          //not redirect to error-page if  -- tmpl not found
          if (angular.isString(resp.config.url) && resp.config.url.indexOf('.tmpl') !== -1) {
            return $q.reject(resp);
          } else {
            location.path('/error/'+resp.status);
          }
          
        break;

        case 401:
          $location.path('/error/'+resp.status);
        break;

        case 400:
          var errorHandler = $injector.get('errorHandler');
          return errorHandler.init(resp); 
         
      }


      return $q.reject(resp);
   
     }
     
  };
}
