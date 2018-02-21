'use strict';

/**
 * @ngdoc controller
 * @name AppWeb.controller:CartAddController
 * @description CartAddController, routes: /#/opportunities/:opportunitie_id, /#/carts/cart_id
 **/

angular
  .module('AppWeb')
  .controller('CartAddController', CartAddController);

CartAddController.$inject = ['$window', '$location', '$routeParams', 'Constant', 'serviceBus', 'lodash',
  'Customer', '$q', 'Opportunity', 'User', 'Contract', 'errorHandler', 'regexpConstant', 'Button', 'Cart', 'RequestApproval'];

function CartAddController($window, $location, $routeParams, Constant, serviceBus, _, Customer, $q, Opportunity, User, Contract, errorHandler, regexpConstant, Button, Cart, RequestApproval) {

  angular.extend(this,{
    Constant: Constant,
    serviceBus: serviceBus,
    Customer: Customer,
    Contract: Contract,
    Opportunity: Opportunity,
    $location: $location,
    $window: $window,
    User: User,
    _: _,
    $q: $q,
    cart: {states: {}},
    errorHandler: errorHandler,
    regexpConstant: regexpConstant,
    user: {},
    button: {},
    Cart: Cart,
    Button: Button,
    $routeParams: $routeParams,
    refundList: {},
    RequestApproval: RequestApproval
  });
  
    if ($routeParams.opportunity_id) {
      //render in left sidebar
      serviceBus.pnavService.updatePnav({
        title:  '新合同',
        uri: '/opportunities/'+$routeParams.opportunity_id,
        customRegexp: /^\/opportunities\/(?:([^\/]+))$/
      });
    }

    this.init($routeParams).then(function() {

      this.current_user = this.serviceBus.shareData.get().current_user;
      this.getApplyRefundsToBePaid();
      this.cart = new this.Cart(this.cart).normalize('states');

      return this.cart;

    }.bind(this))

    .then(function(){
      return this.serviceBus.customers.getCartCustomerDetails(this.cart.id).then(function (resp) {
        angular.extend(this, {customer: new Customer(angular.extend(resp, {owner_id: this.cart.owner.id})).normalize('states')});
        return this.customer;
      }.bind(this));
    }.bind(this))
    .then(function(){
      this.anchorScroll();
    }.bind(this))
    .catch(this.errorHandler.init);
}

CartAddController.prototype.init = function($routeParams) {
  var deferred = this.$q.defer();

  if ($routeParams.opportunity_id) {

    return this.getOpportunity($routeParams.opportunity_id).then(function () {

      if (!_.isEmpty(this.cart.orders)) {

        this.$location.path('/carts/' + this.cart.id);

        deferred.reject();
        return deferred.promise;

      }

      deferred.resolve();
      return deferred.promise;


    }.bind(this));

  } else if ($routeParams.cart_id) {

    return this.getCartData().then(function(){
      this.serviceBus.pnavService.updatePnav({
        title:  this.cart.title,
        uri: '/carts/'+$routeParams.cart_id,
        customRegexp: /^\/carts\/(?:([^\/]+))$/
      });

     var refundlists = this._.filter(this.cart.fund_transactions, function(item){return item.transaction_type === 'refund' || item.transaction_type === 'transfer'});
     return angular.extend(this, {refundList: refundlists});

    }.bind(this));
  }

  return deferred.promise;

};

CartAddController.prototype.anchorScroll = function () {
  this.serviceBus.utils.callAnchorScroll();
};

CartAddController.prototype.getParentTransaction = function (transaction) {
  if(transaction.parent_fund_transaction_id){
    var parent_fund_transaction = this._.find(this.cart.fund_transactions, function(fund_transaction){return fund_transaction.id === transaction.parent_fund_transaction_id;});
    transaction.parent_fund_transaction_number = parent_fund_transaction ? parent_fund_transaction.transaction_number : null;
  }
};

CartAddController.prototype.createFundTransaction = function (transaction) {
  var context = {context: function () {
     return {cart: angular.copy(this.cart), transaction: angular.copy(transaction)};
  }.bind(this)};
  this.serviceBus.ui.popup('lg', 'contract/payment', context, 'PaymentCartModal', 'main').result.then(function (resp) {
    this.cart = new this.Cart(resp).normalize('states');
  }.bind(this));
};

CartAddController.prototype.addOrder = function () {
  var context = {context: function () { return this.cart; }.bind(this)};
  this.serviceBus.ui.popup('lg', 'order/add', context, 'OrderAddModalController', 'main').result.then(function (resp) {
    this.addProduct(resp);
    this.getCartData();
  }.bind(this));
};

CartAddController.prototype.postSubmissionProcess = function () {

  var order = this.cart.orders && this.cart.orders[0];
  var request_approval = order && order.request_approvals[0];
  if (!request_approval || this._.isEmpty(request_approval.approval_steps)) {
    return this.serviceBus.ui.alert(null, '购物车 No.'+ this.cart.id + ' 已经提交成功', '继续', 'success').result.then(function (resp) {
      this.$location.path('/carts/' + this.cart.id);
    }.bind(this));
  }
  if (request_approval.editable_sequence !== undefined) {
    this.editApproverModal('lg', request_approval, true);
  }
};

CartAddController.prototype.submit = function () {
	if (this.cart.id) {
		this.serviceBus.carts.submitCart(this.cart.id).then(function (resp) {
			this.getCartData().then(function(){
        this.postSubmissionProcess();
      }.bind(this));
		}.bind(this)).catch(this.errorHandler.init);
	}
};

CartAddController.prototype.getOpportunity = function (opportunity_id) {
  var deferred = this.$q.defer();
  return this.serviceBus.contracts.getOpportunity(opportunity_id).then(function (resp) {

    if (resp.code === 202){
	    deferred.reject(resp);
      return deferred.promise;
    } else {
      //get Customer
      angular.extend(this,
        {opportunity: new this.Opportunity(resp).normalize('main')},
        {customer: new this.Customer(angular.extend(resp.customer, {owner_id: resp.cart.owner.id})).normalize('states')},
        {product_line: resp.product_line},
        {cart: new this.Cart(resp.cart).normalize('states') }
      );

      deferred.resolve();
      return deferred.promise;
    }

    }.bind(this));
};

CartAddController.prototype.getCartData = function () {
  var cart_id = this.$routeParams.cart_id || this.cart.id,
  history = this.serviceBus.shareData.get().history,
  doCleanCache = this.regexpConstant.order_contract.test(angular.isArray(history) && history[0].locationPath) || !this.$routeParams.cache;

  return this.serviceBus.carts.getOrders(cart_id, doCleanCache)
    .then(function (resp) {
      angular.extend(this,
        {cart: new this.Cart(resp).normalize('states')},
        {opportunity: {id: resp.orders[0].opportunity_id}}
      );
      return this;
    }.bind(this))
    .catch(this.errorHandler.init);

};


CartAddController.prototype.getApplyRefundsToBePaid = function(){
  angular.extend(this.cart, {apply_reason_contracts: this._.filter(this.cart.apply_reason_contracts,
    { state: 'ApplyReasonToBePaid',
      apply_refund_contract: {
        is_released: false
      }
    }
  )});
};

CartAddController.prototype.approvalStepValidationModal = function (size, approval_step_id) {
	var context = {context: function () { return approval_step_id; }.bind(this)};
		this.serviceBus.ui.popup(size || 'lg', 'local_shared/approval_step/approval', context, 'ApprovalStepValidationModalController', 'main').result.then(function (resp) {
       var request_approval = new this.RequestApproval(resp.data, this.cart.orders[0].contracts[0].owner_id).normalize('states');
       if (request_approval.editable_sequence !== undefined && resp.type === 'approved') {
        this.editApproverModal('lg', request_approval, false);
      } else {
        this.getCartData();
      }
    }.bind(this));
};


CartAddController.prototype.editApproverModal = function (size, request_approval, isPostSubmissionProcess) {
  var context = {
    context: function () {
      return {
        approval_steps: request_approval.approval_steps,
        editable_sequence: request_approval.editable_sequence
      };
    }
  },
		uibModalInstance = this.serviceBus.ui.popup(size || 'lg' ,
		'local_shared/approval_step/edit_approver', context, 'EditApproverModalController', 'main');
		uibModalInstance.result.then(function (resp) {
        if (isPostSubmissionProcess) {
          return this.serviceBus.ui.alert(null, '购物车 No.'+ this.cart.id + ' 已经提交成功', '继续', 'success').result.then(function () {
            this.$location.path('/carts/' + this.cart.id);
          }.bind(this));
        }
        this.getCartData();
    }.bind(this));
};

CartAddController.prototype.addProduct = function (order, contractProductItem) {
  var product_line = order && order.product_line || {};
  var cart = this.cart;
  var context = {
    context: function () {
      return {'order': order, 'contracts_product': contractProductItem, 'cart': cart };
    }
  };
  var typeOfModal = product_line.key === 'study_tour' ? 'counselling' : product_line.key;//hardcoded for now
  this.serviceBus.ui.popup('lg',
  'product/' + typeOfModal + '/main',
      context, this.serviceBus.utils.camelCased('CartModal-' + typeOfModal + 'Controller'), 'main')
    .result.then(function () {
      this.getCartData();
    }.bind(this));
};

CartAddController.prototype.deleteContractProduct = function ($orderIndex, $orderContractIndex, contractProductId) {
	if ($orderIndex !== undefined && $orderContractIndex !== undefined && contractProductId !== undefined) {
		var order = this.cart.orders[$orderIndex],
      contract = order.contracts[$orderContractIndex],
      contracts_products_names = this._.map(contract.contracts_products, function(item) {
      return item.product_name
    }).join(',');
		var message = contract.number + ', ' + order.product_line.name + ' - ' + contracts_products_names;
		this.serviceBus.ui.alert('确认删除该产品吗?', message, '确认','success').result.then(function () {
      this.serviceBus.contracts.deleteContractProduct(contractProductId).then(function () {
        this.getCartData();
      }.bind(this));
    }.bind(this));
	}
};

CartAddController.prototype.deleteOrderContract = function ($orderIndex, contract) {
  var contractId = contract.id;
  if ($orderIndex === undefined || contractId === undefined) {
    return;
  }
  var order = this.cart.orders[$orderIndex],
    contracts_products_names = this._.map(contract.contracts_products, function(item) {
      return item.product_name
    }).join(',');
  var message = contract.number + ', ' + order.product_line.name + ' - ' + contracts_products_names;
  this.serviceBus.ui.alert('确认删除该产品吗?', message, '确认','success').result.then(function() {
    this.serviceBus.contracts.deleteOrderContract(contractId).then(function () {
      this.getCartData();
    }.bind(this));
  }.bind(this));
};

CartAddController.prototype.deleteOrder = function ($orderIndex, orderID) {
  if ($orderIndex === undefined) {
    return;
  }
  var order = this.cart.orders[$orderIndex];
  var orderID = order.id;
  var message = orderID + ', ' + '订单：' + order.project_name + ' - ' + order.product_line.name ;
  this.serviceBus.ui.alert('确认删除该订单吗?', message, '确认','success').result.then(function() {
    this.serviceBus.orders.deleteOrder(orderID).then(function () {
      this.getCartData();
    }.bind(this));
  }.bind(this));
};

CartAddController.prototype.payApplyRefundModal = function (size, apply_refund_contract) {
  var context = {context: function () { return apply_refund_contract; }.bind(this)},
    uibModalInstance = this.serviceBus.ui.popup(size || 'lg' ,
      'cart/apply_refund_contract/main', context, 'PayApplyRefundContractModalController', 'main');
  uibModalInstance.result.then(function (resp) {
    this._.remove(this.cart.apply_reason_contracts, {id: resp});
    this.getCartData();
  }.bind(this));
};

CartAddController.prototype.editCustomerModal = function (size) {
  var context = {context: function () { return angular.extend(this.customer, {button: this.cart.button}); }.bind(this)},
    uibModalInstance = this.serviceBus.ui.popup(size || 'lg' ,
      'local_shared/edit_customer/main', context, 'EditCustomerModalController', 'main');
  uibModalInstance.result.then(function (resp) {
    this.customer = new this.Customer(angular.extend(resp, {owner_id: this.cart.owner.id})).normalize('states');
  }.bind(this));
};

CartAddController.prototype.openRejectModal = function ($orderIndex) {
  if ($orderIndex === undefined) {
    return;
  }
  var order = this.cart.orders[$orderIndex];
  var context = {context: function () { return order; }};
  this.serviceBus.ui.popup('lg' ,'order/reject', context, 'OrderRejectModalController', 'main')
    .result.then(function(resp){
      //should return cart  in response
      this.getCartData();
    }.bind(this), function () {
    //modal is dismissed
  });
};

CartAddController.prototype.openJinGe = function (file) {
  var link = 'KGBrowser://$link:'+this.Constant.stampAPI+'/DocumentEdit.jsp?uuid='+file.uuid+'';
  this.$window.open(link, '_blank');
};

CartAddController.prototype.goStamp = function (file) {
  this.serviceBus.file.createExternalFileStamp(file.uuid).then(function (resp) {
    this.openJinGe(file);
  }.bind(this));
};

CartAddController.prototype.goJingePrint = function (file) {
  this.serviceBus.file.checkLastPrint(file.uuid).then(function (resp) {
    if(resp.last_external_file_print && resp.last_external_file_print.print_at){
      this.enterPrintReason(resp);
    }else {
      this.openJinGe(file);
    }
  }.bind(this));
};

CartAddController.prototype.enterPrintReason = function (file) {
  var context = {context: function () { return  file; }.bind(this) };
  this.serviceBus.ui.popup('lg', 'local_shared/enter_print_reason', context, 'EnterPrintReasonController', 'main').result.then(function (resp) {
    this.openJinGe(file);
  }.bind(this));
};

CartAddController.prototype.invalidStampedFile = function (receipt_number, external_file_uuid) {
    if (this.cart.fund_transactions){
      var message = '收据号' + receipt_number;
      this.serviceBus.ui.alert('确认注销电子章', message, '确认','success').result.then(function() {
      this.invalidStampedContractSave(external_file_uuid);
      }.bind(this), function () {
     //modal is dismissed
    });
  }
};

CartAddController.prototype.invalidStampedContractSave = function (external_file_uuid) {
  this.serviceBus.file.invalidStampedFile(external_file_uuid)
      .then(function (result) {
        this._.map(this.cart.fund_transactions||[], function(ft){
          if (ft.id === result.id) {
            ft.external_files = result.external_files;
          }
        });
    }.bind(this));
};

CartAddController.prototype.deleteFile = function (file) {
  var message = '确认删除文件';
  this.serviceBus.ui.alert('', message, '确认','success').result.then(function() {
  this.serviceBus.file.delete(file.uuid)
    .then(function (result) {
      this.getCartData();
    }.bind(this));
  }.bind(this));
};
