/* global tv4 */
/* global Pusher */


/**
 * @ngdoc overview
 * @name AppWeb
 * @description
 * # AppWeb
 *
 * Main module of the application.
 */

angular.module('AppWeb', [
  'ui.bootstrap',
  'animate',
  'tandibar/ng-rollbar',
  'ngRoute',
  'ngLoadingSpinner',
  'Constant',
  'Tmpls',
  'TmplsBootstrap',
  'activeTab',
  'ngLodash',
  'staticRoutes',
  'ngSanitize',
  'smart-table',
  'angular.filter',
  'paginator',
  'ngStSelectAll',
  'newrelic-angular'
]);

angular.module('AppWeb').constant('tv4', tv4);//validator (create angular wrapper)
/* jshint ignore:start */
angular.module('AppWeb').constant('Pusher', Pusher);//Pusher (create angular wrapper)
/* jshint ignore:end */
angular.module('AppWeb').constant('regexpConstant', {
  'edit': /\/edit\/(?:([^\/]))$/,
  'add': /\/add$/,
  'error': /^\/error\/(?:([^\/]+))$/,
  'order_contract': /^\/carts\/(?:([^\/]))\/contracts\/(?:([^\/]))$/
});


angular.module('AppWeb').run(Init);

Init.$inject = ['$rootScope', '$route', 'serviceBus', 'User', '$location'];

function Init ($rootScope, $route, serviceBus, User, $location) {
  'use strict';

  $rootScope.$on('$locationChangeStart',function($event, toState, fromState) {

      if (serviceBus.shareData.get().current_user || /^\/error(\/(?:(\d+)))?$/.test($location.path()) ) {
        return;
      }

      if (!serviceBus.shareData.get().current_user) {

        $event.preventDefault();
        // The only issue with this way to do is because Backend is slow, first page loading might take a while
        serviceBus.users.getUser().then(function(){

          if (!serviceBus.shareData.get().users){
            serviceBus.users.getCurrentUserGroupsUsers().then(function(){

              if (!serviceBus.shareData.get().state_description){
                serviceBus.picklists.getAllStates().then(function(){

              $location.path($location.path());
              $route.reload();
              });
            }
          });
        }
      });
    }
  });

  serviceBus.shareData.set({menu: [].concat(serviceBus.staticRoutes.menuItemsSet(), [])});

  serviceBus.shareData.set({definitions: serviceBus.validator.getSchemaDef() });

}
