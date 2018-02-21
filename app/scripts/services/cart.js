/**
  * @ngdoc service
  * @name AppWeb.service:cartService
  * @requires $http
 * @description cartService

**/

angular
  .module('AppWeb')
  .service('cartService', cartService);

cartService.$inject = ['$http', 'Constant', 'Resource'];

function cartService ($http, Constant, Resource) {
  'use strict';

  /* jshint validthis:true */

  var API = Constant.API,
    API_SUBMIT_CART = API + '/carts/%s/submit',
    API_GET_ORDERS_BY_CART_ID = API + '/carts/%s',
    API_FUND_TRANSACTION_CREATE = API + '/carts/%s/pay',
    API_FUND_TRANSACTION_UPDATE = API + '/fund_transactions/%s/fund_transactions',
    API_GET_APPLY_REFUND_PER_CART = API + '/carts/%s/apply_refunds',
    API_PAY_APPLY_REFUND = API + '/apply_refund_contracts/%s/pay',
    API_CART = API + '/carts',
    API_REASSIGN_CARTS = API + '/carts/assign',
    API_CART_ALL_TRANSFER_DEPOSIT = API + '/carts/%s/transferables';

  this.submitCart = function (cart_id) {
    var resc = new Resource(API_SUBMIT_CART).replace(cart_id);
    return $http.post(resc.endpoint).then(resc.respHandler);
  };

  this.getOrders = function(cart_id, doCleanCache) {
    var resc = new Resource(API_GET_ORDERS_BY_CART_ID).replace(cart_id);
    return $http.get(resc.endpoint, {timeToLive: Constant.timeToLive, doCleanCache: doCleanCache}).then(resc.respHandler);
  };


	this.fundTransaction = {
		create: function (cart_id, formData) {
			var resc = new Resource(API_FUND_TRANSACTION_CREATE).replace(cart_id);
			return $http.post(resc.endpoint, formData).then(resc.respHandler);
		},
		update: function (original_fund_transaction_id, formData) {
			var resc = new Resource(API_FUND_TRANSACTION_UPDATE).replace(original_fund_transaction_id);
			return $http.post(resc.endpoint, formData).then(resc.respHandler);
		}
	};

  this.getCartApplyRefund = function (cart_id) {
    var resc = new Resource(API_GET_APPLY_REFUND_PER_CART).replace(cart_id);
    return $http.get(resc.endpoint).then(resc.respHandler);
  };

  this.payApplyRefundContract = function(refund_id, formData) {
  	var resc = new Resource(API_PAY_APPLY_REFUND).replace(refund_id);
    return $http.post(resc.endpoint, {transaction: formData}).then(resc.respHandler);
  };

  this.getCartLists = function(params, doCleanCache) {
    var resc = new Resource(API_CART);
    resc.paramSerializer(params);
    return $http.get(resc.endpoint, { doCleanCache: doCleanCache }).then(resc.respHandler);
  };

  this.reassignCarts = function(params) {
    var resc = new Resource(API_REASSIGN_CARTS).toURL();
    return $http.post(resc.endpoint, params).then(resc.respHandler);
  };

  this.getAllTransferAndDeposit = function(cart_id) {
    var resc = new Resource(API_CART_ALL_TRANSFER_DEPOSIT).replace(cart_id);
    return $http.get(resc.endpoint).then(resc.respHandler);
  };

}
