/**
  * @ngdoc service
  * @name AppWeb.service:pnavService
  * @requires shareDataService
 * @description Service for Left Side Bar
**/

angular
  .module('AppWeb')
  .service('pnavService', pnavService);

pnavService.$inject = ['shareDataService', 'lodash', '$route'];

function pnavService (shareDataService, _, $route) {
  'use strict';

/**
     * @ngdoc method
     * @name AppWeb.service:pnavService#updatePnav
     * @methodOf AppWeb.service:pnavService
     * @description method for update Left Side Bar Block
     * Since Generated contract added and removed dynamically to sidebar, we need that method
**/

  function updatePnav(generatedContractItem) {

	  var shareData = shareDataService.get(), menu = shareData.menu, history = shareData.history, route = $route.current && $route.current.$$route || {};

		//delete previous generated item
		if (angular.isArray(history) && history[0].header && history.length === 2) {
			//history[0].header take header from previous route
			update(history[0].header);
		}

    if (generatedContractItem && route.header) {
			update(route.header, true);
    }


		function update(h, isAdd) {

			var itemContract = _.filter(menu, function (item) {
				return String.prototype.toLowerCase.call(item.header) === String.prototype.toLowerCase.call(h);
			});

			if (itemContract.length && angular.isArray(itemContract[0].items)) {

				if (isAdd) {
					angular.extend(generatedContractItem, {hidden: false, generated: true, regexp: generatedContractItem.customRegexp});
				}

				itemContract[0].items = [].concat(
					_.filter(itemContract[0].items, function(item) {return !item.generated; }),
					isAdd ? generatedContractItem  : []
				);

			}

		}

    shareDataService.set({menu: menu});

  }

  return {
    updatePnav: updatePnav
  };



}
