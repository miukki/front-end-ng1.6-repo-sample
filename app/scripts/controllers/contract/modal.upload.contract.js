'use strict';

/**
 * @ngdoc controller
 * @name AppWeb.controller:UploadContractModalController
 * @description UploadContractModalController
 * @requires serviceBus
 * @requires $uibModalInstance
 * @requires context
 * @requires $filter
 **/
angular
  .module('AppWeb')
  .controller('UploadContractModalController', UploadContractModalController);

UploadContractModalController.$inject = ['serviceBus', '$uibModalInstance', 'context', '$filter', 'Contract'];

function UploadContractModalController(serviceBus, $uibModalInstance, context, $filter, Contract) {
  angular.extend(this, {
    serviceBus: serviceBus,
    $uibModalInstance: $uibModalInstance,
    schema: {},
    _data: {file_tags: {}},
    contract: context || {},
    $filter: $filter,
	_: _,
	params: {
	  model_name: 'Contract',
	  type: 'signed'
	},
	external_files: context.external_files
  }, serviceBus.datePicker.beforeRenderDatePicker());
  angular.extend(this.dateOptions, {maxDate: new Date()});

  if (context.signed_at) {
  	angular.extend(this._data, {signed_at: new Date(context.signed_at)});
  }

  (new Contract()).getSchema('uploadContract').then(function(resp) {
    this.schema = resp.data;
  }.bind(this));

}

/**
 * @ngdoc method
 * @name AppWeb.controller:UploadContractModalController#save
 * @methodOf AppWeb.controller:UploadContractModalController
 * @param {Form} form Form object.
 * @description
 * Send data to server
 */
UploadContractModalController.prototype.save = function(form) {
  if (form && this.serviceBus.validate(form.$name).valid) {
    this.uploadFiles().then(function(uploaded_ids){
      this.serviceBus.contracts.uploadSignedContract(this.contract.id, {
        signed_at: this.$filter('formatTime')(this._data.signed_at, 'yyyy-MM-ddTHH:mm:ss\'Z\''),
        files: uploaded_ids
      }).then(function (resp) {
		    this.$uibModalInstance.close(resp);
	    }.bind(this));
    }.bind(this));
  }
};
