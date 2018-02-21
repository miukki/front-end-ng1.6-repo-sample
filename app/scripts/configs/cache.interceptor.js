'use strict';

angular
  .module('AppWeb')
  .factory('cacheInterceptor', cacheInterceptor);

cacheInterceptor.$inject = ['$cacheFactory'];

function cacheInterceptor($cacheFactory) {
  var http_ttl_cache = {};
  return {
    request: function (config) {
      var N;
      if (config.timeToLive) {
        config.cache = true;
        N = config.timeToLive;
        config.timeToLive = undefined;
        if ((new Date().getTime() - (http_ttl_cache[config.url] || 0) > N) || config.doCleanCache) {
          $cacheFactory.get('$http').remove(config.url);
          http_ttl_cache[config.url] = new Date().getTime();
	        config.doCleanCache = undefined;
        }
      }
      return config;
    }
  };
}

