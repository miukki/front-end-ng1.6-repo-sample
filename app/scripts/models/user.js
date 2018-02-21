
angular
	.module('AppWeb')
	.factory('User', ['lodash', function (_) {
		'use strict';

		var User = function (data) {

			this.data = angular.extend({}, data);
			this.active_roles = this.data.extra && angular.isArray(this.data.extra.active_roles) && this.data.extra.active_roles || [];


		};


		User.prototype.normalize = function (type) {

			switch (type) {
				case 'main':
					this.getMain();
					break;
			}

			return this.output;

		};

		User.prototype.getMain= function () {

		  var permissions = [];

			if (this.active_roles.length) {
			  _.forEach(this.active_roles, function (item) {
			    var m_permissions = _.map(item.permissions, 'name');
                permissions = [].concat(permissions, m_permissions);
			  });

			}
			var active_roles = _.filter(this.active_roles, {app: {id: 'app'}});
			this.output = angular.extend(this.data, { permissions: _.uniq(permissions), active_roles: _.map(active_roles, 'name') });
		};


		return User;

	}]);
