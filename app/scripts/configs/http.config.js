'use strict';

angular
  .module('AppWeb')
  .config(configHttpProvider);

configHttpProvider.$inject = ['$httpProvider', '$compileProvider'];

function configHttpProvider ($httpProvider, $compileProvider) {
  $compileProvider.debugInfoEnabled(false);
  $httpProvider.useApplyAsync(true);
  $httpProvider.defaults.withCredentials = true;
  $httpProvider.defaults.paramSerializer = '$httpParamSerializerJQLike';
  $httpProvider.interceptors.push('errorInterceptor');
  $httpProvider.interceptors.push('cacheInterceptor');
  $httpProvider.interceptors.push('sessionInjector');

}
