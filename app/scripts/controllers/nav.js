
/**
  * @ngdoc controller
  * @name AppWeb.controller:NavController
  * @description NavController
  * @requires AppWeb.service:shareDataService
  * @requires _
  * @requires $location
  * @requires regexpConstant
**/
angular
  .module('AppWeb')
  .controller('NavController', NavController);

NavController.$inject = ['shareDataService', 'lodash', '$location', 'regexpConstant', 'serviceBus', 'User', 'Pusher', 'Constant', '$timeout'];

function NavController (shareDataService, _, $location, regexpConstant, serviceBus, User, Pusher, Constant, $timeout) {
  'use strict';

  this.menuItems = shareDataService.getMenu();
 
  this.appLabel = 'CONTRACTS';

  angular.extend(this, {
    regexpConstant: regexpConstant,
    $location: $location,
    serviceBus: serviceBus,
    current_user: serviceBus.shareData.get().current_user,
    User: User,
    pusher: new Pusher(Constant.config.pusher.key, {
      cluster: Constant.config.pusher.cluster
    }),
    counRrequestApproval: 0,
    $timeout: $timeout
  });

  this.init();  
}

NavController.prototype.init = function () {
  return !this.current_user && this.serviceBus.users.getUser().then(function(resp){
    this.current_user = (new this.User(resp)).normalize('main');

    //subscribe to channel
    this.serviceBus.contracts.getApprovalStepsTaskCount(this.current_user.user_id).then(function(resp){
      this.updateCount(resp.waiting_steps || 0);
    }.bind(this)).finally(function(){
      this.bindChannel();
    }.bind(this));
    
  }.bind(this));

};

NavController.prototype.updateCount = function (count) {
  this.counRrequestApproval += count;
};

NavController.prototype.bindChannel = function () {

  var channel = this.pusher.subscribe(this.current_user.user_id+'_request_approval_notifications');
    
  channel.bind('new_request_approval', function (resp) {
    
    //update counter +1
    this.$timeout(this.updateCount.bind(this, resp.count || 1), 100);

  }.bind(this));

};

