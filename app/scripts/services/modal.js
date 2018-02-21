/**
  * @ngdoc service
  * @name AppWeb.service:modalService
  * @requires $uibModal
 * @requires $rootScope
 * @requires $filter
**/

angular
  .module('AppWeb')
  .factory('modalService', modalService);

modalService.$inject = ['$uibModal', '$rootScope', '$filter'];


function modalService ($uibModal, $rootScope, $filter) {
  'use strict';

  function dismissModal(modal, reason) {
    if (modal) {
      modal.dismiss(reason);
    }
  }

  var uibModalInstance;

  $rootScope.$on('$routeChangeStart', function(event) {
    dismissModal(uibModalInstance, event.name);
  });

  function showModal (size, templateUrl, context, controller, controllerAs) {


    dismissModal(uibModalInstance, 'new popup is opened');

	  uibModalInstance = $uibModal.open({
      backdrop: 'static',
      animation: true,
      ariaLabelledBy: 'modal-title',
      ariaDescribedBy: 'modal-body',
      templateUrl: templateUrl,
      controller: controller,
      controllerAs: controllerAs || 'modal',
      bindToController: true,
      size: size,
      resolve: context
     // scope: {}
    });


	  if (uibModalInstance) {

		  uibModalInstance.opened.then(function(context, some){
			  $rootScope.modalActive = true;
		  });

		  uibModalInstance.result.then(function (selectedItem) {
			  $rootScope.modalActive = false;
		  }, function () {
			  $rootScope.modalActive = false;
		  });

	  }

    return uibModalInstance;
  }

  function getCurrentStep (modalSteps) {
    var modalStep = $filter('filter')(modalSteps, {isActive: true});
    return modalStep[0];
  }

  function moveStep(idx,s,modalSteps) {

    var index = idx>=0 && idx  || getCurrentStep(modalSteps).index;

    if (!modalSteps[index+s]) {
      return;
    }
  
    modalSteps[index].isActive = false;
    modalSteps[index+s].isActive = true; 

  }

  function cancel() {
	  dismissModal(uibModalInstance);
  }


  return {
    showModal: showModal,
    getCurrentStep: getCurrentStep,
    moveStep: moveStep,
    cancel: cancel
  };

}


