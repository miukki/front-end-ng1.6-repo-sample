'use strict';

/**
 * @ngdoc controller
 * @name AppWeb.controller:ProductAttributesController
 * @description
 * ProductAttributesController: Controller for  attributes.tmpl
 **/
angular
.module('AppWeb')
.controller('ProductAttributesController', ProductAttributesController);

ProductAttributesController.$inject = ['serviceBus', 'lodash', '$scope'];

function ProductAttributesController (serviceBus, _, $scope) {
    var main = $scope.$parent && $scope.$parent.main;

    angular.extend(this, {
        serviceBus: serviceBus,
        _: _,
        _data: main._data,
        order_id: main.order && main.order.id,
        product_attribute_options_radio: [{id: 'yes', name: '是', checked: true}, {id: 'no', name :'否'}],
        product_attribute_options_collections: {},
        selectedProductDetailsFiltered: main.selectedProductDetailsFiltered,
        mode: main.mode,
        _name: {},
        preset_attributes_v: {},
        modal_counselling: main.modal_counselling,
        selectedProduct: main.selectedProduct || {},
        triggerChanges: main.triggerChanges.bind(main),
        takeProductId: main.takeProductId,
        parentScope: main
    });

    this.selected_product_id =  this.selectedProduct[this.mode === 'PATCH' ? 'product_id' : 'id'];
    this.dateOptions = serviceBus.datePicker.beforeRenderDatePicker();

    this.getGroupProductDetails();

    //preset Attributes if PATCH
    if (this.mode === 'PATCH') {
      _.forEach(this.selectedProductDetailsFiltered, function(att){
        this.preset_attributes_v[att.product_attribute_id] =
        {
          input_method: att.input_method,
          value : this.presetVTypes(att),
          label: att.contracts_product_detail && att.contracts_product_detail.label
        };
      }.bind(this));
    }
}

ProductAttributesController.prototype.getGroupProductDetails = function () {
  
  var hash = this._.groupBy(this.selectedProductDetailsFiltered, 'product_id');

  var keys = this._.keys(hash);
  var group = this._.map(keys, function(key){
    var product_id = key;
    var product_details = hash[product_id];
    var product_name = this.selectedProduct.name || this.selectedProduct.product_name;

    if (!this._.isEmpty(this.selectedProduct.product_bundles)){
      var product = this._.find(this.selectedProduct.product_bundles, function (product_bundle) {
        return this.takeProductId(product_bundle) === product_id;
      }.bind(this)) || {};
      product_name = product.name;
    }

    return {
      'product_id': product_id,
      'product_details': product_details,
      'product_name': product_name
    };

  }.bind(this));
  
  angular.extend(this, {groupProductDetails: group});
  angular.extend(this.parentScope, {groupProductDetails: group});
};

ProductAttributesController.prototype.chunk = function(arr, chunkSize) {
  var output = [];
  for (var i=0; i<arr.length; i+=chunkSize) {
    output.push(arr.slice(i,i+chunkSize));
  }
  return output;
};

ProductAttributesController.prototype.presetVTypes = function (att) {
  var details = att.contracts_product_detail || {};
  var result = att.input_method === 'datetime' ? new Date(details.value) : att.input_method === 'integer' ? +details.value || 0 : details.value;
  return result;
};

ProductAttributesController.prototype.isReady = function() {
 return (this.mode === 'PATCH' && !this._.isEmpty(this.preset_attributes_v)) || this.mode === 'POST';
};


ProductAttributesController.prototype.initPresetAttr = function (att) {
  var valueObj  = this.preset_attributes_v[att.product_attribute_id] || {};

  if (this.mode === 'PATCH' && !att.product_attribute_option_value){
    att.product_attribute_option_value = valueObj.value;
    if (att.input_method === 'typeahead') {
      att.product_attribute_option_name = valueObj.label;
      att.product_attribute_option_value = {key: valueObj.value, name: valueObj.label};
    }
  }

  if (this.mode === 'POST' && !att.product_attribute_option_value) {
    att.product_attribute_option_value = valueObj.value;
    if (att.input_method === 'datetime') {
      att.product_attribute_option_value = new Date(valueObj.value);
    }
    if (att.input_method === 'integer') {
      att.product_attribute_option_value = 1;
    }
  }
  this._data['attr-'+att.input_method+att['$index']] = att.product_attribute_option_value;

};

ProductAttributesController.prototype.seTime = function (attr) {
  attr.product_attribute_option_value = this.mode === 'PATCH' ? new Date(attr.product_attribute_option_value ) : new Date();
};

ProductAttributesController.prototype.getProductAttr = function() {
    this.serviceBus.picklists.getProductAttr(this.order_id, this.selected_product_id).then(function(resp){

        this.product_attribute_options_collections = resp;

      }.bind(this));

};


ProductAttributesController.prototype.updateModelAttr = function (att) {

    this._data['attr-'+att.input_method+att.$index]= att && att.product_attribute_option_value;

};

ProductAttributesController.prototype.formatTypeAhead = function(model, att, form) {
  if (Object.prototype.toString.call(model) === '[object Object]'){
    att.product_attribute_option_value = model;
  }
  this._data['attr-'+att.input_method+att['$index']]= att.product_attribute_option_value && att.product_attribute_option_value.name;
  this.triggerChanges(form);
  return model && model.name || att.product_attribute_option_name;
};

ProductAttributesController.prototype.getRangeInfo = function (fixed_value) {
    var f = fixed_value || '1-15';
    var output = {
      min: f.split('-')[0],
      max: f.split('-')[1]
    };
    return output;
  }

ProductAttributesController.prototype.getterSetter = function(newName) {
    return arguments.length ? (this._name = newName) : this._name;

};
