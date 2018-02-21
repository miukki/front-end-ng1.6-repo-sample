/**
  * @ngdoc service
  * @name AppWeb.service:shareDataService
  * @requires no requirements
**/

angular
  .module('AppWeb')
  .factory('shareDataService', shareDataService);

shareDataService.$inject = [];

function shareDataService () {
  'use strict';

  var savedData = {};//closure for share data purpose

  function set(data) {
    savedData = angular.extend(savedData, data);
  }

  function get() {
    return savedData || {};
  }

  function getMenu () {
    return get().menu || [];
  }


  return {
    set: set,
    get: get,
    getMenu: getMenu
  };

}

