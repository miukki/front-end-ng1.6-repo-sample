/**
 * @ngdoc directive
 * @name AppWeb.directive:contractStates
 * @requires
 * @restrict
 * @description contractStates
 * @example
 <pre>
 <fitler-main ctrl="CtrlName" data="main._data" tmpl="'local_shared/filter.tmpl'"></fitler-main>
 </pre>
 */


angular
.module('AppWeb')
.directive('filterMain', filterMain);

filterMain.$inject = [];

function filterMain() {
  'use strict';
  function link($scope, $element, $attrs, $ctrl) {
  } 
  return {
    scope: {
        filterForm: '=?'//tab type
        
    },
    name: 'ctrl',
    controller: '@',
    controllerAs: 'main',
    bindToController: {
        _data: '=data',
        search: '&?',
        type: '=?'
    },
    transclude: true,
    templateUrl: function(element, attrs) {
        return attrs.tmpl;
    },
    link: link
};
}


