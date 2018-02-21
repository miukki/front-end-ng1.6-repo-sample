'use strict';

/**
 * @ngdoc service
 * @name AppWeb.service:Resource
 * @requires $httpParamSerializer
 * @description Resource
 */

angular
  .module('AppWeb')
  .factory('Resource', ResourceModel);

ResourceModel.$inject = ['$httpParamSerializer', '$injector'];

function ResourceModel ($httpParamSerializer, $injector) {


  var Resource = function (baseUrl) {
    this.base = baseUrl;
    this.query = [];
    this.endpoint = '';
    this.params = '';
    this.errorHandler = $injector.get('errorHandler');
  };
  

  Resource.prototype.appendClause = function (clause) {
    this.query = [].concat(this.query, clause || []);
    return this;
  };

  Resource.prototype.respHandler = function(resp) {
    return resp.headers('x-pagination-count') ? { x_pagination_count: resp.headers('x-pagination-count'), data: resp.data } : resp.data || {};
  };


	Resource.prototype.paramSerializer = function (params) {
		this.params = $httpParamSerializer(params);
    this.toURL();
    return this;
	};

  Resource.prototype.paramSerializerjQueryLike = function (params) {
    this.params = this.jQueryLikeParamSerializer(params);
    this.toURL();
    return this;
  };


  Resource.prototype.addQuery = function (query, fields) {
    var clause = query+'=' + fields.join(',');
    this.appendClause(clause).toURL();
    return this;
  };


  Resource.prototype.toURL = function () {
    //TODO refactoring: remove this.query
    this.endpoint =  this.query.length ?
      ((this.endpoint || this.base) + '?' + (this.query.join('&') + (this.params ? '&' + this.params : ''))) :
      ((this.endpoint || this.base) + (this.params ? '?' + this.params : ''));


    return this;
  };


  // FIXME: This is basically the code of $httpjQueryLikeParamSerializer service but looks like we can't access to it.
  Resource.prototype.jQueryLikeParamSerializer = function(params) {
      if (!params) { 
        return '';
      }
      var parts = [];
      serialize(params, '', true);
      return parts.join('&');

      function serializeValue(v) {
        if (angular.isObject(v)) {
          return angular.isDate(v) ? v.toISOString() : angular.toJson(v);
        }
        return v;
      }

      function serialize(toSerialize, prefix, topLevel) {
        if (angular.isArray(toSerialize)) {
          angular.forEach(toSerialize, function(value, index) {
            serialize(value, prefix + '[' + (angular.isObject(value) ? index : '') + ']');
          });
        } else if (angular.isObject(toSerialize) && !angular.isDate(toSerialize)) {
          angular.forEach(toSerialize, function(value, key) {
            serialize(value, prefix +
                (topLevel ? '' : '[') +
                key +
                (topLevel ? '' : ']'));
          });
        } else {
          if (angular.isFunction(toSerialize)) {
            toSerialize = toSerialize();
          }
          parts.push(angular.$$encodeUriQuery(prefix) + '=' +
              (toSerialize == null ? '' : angular.$$encodeUriQuery(serializeValue(toSerialize))));
        }
      }
    };


	/**
   * @ngdoc method
   * @name AppWeb.service:Resource#replace
   * @methodOf AppWeb.service:Resource
   *
   * @description
   * Replace {%s} to values.
   * @example
   * replace(['some']) OR replace('some').
   *
   * @param  {String|Object} some Argument.
   * @returns {String} The updated url.
   */
  Resource.prototype.replace = function(some) {
    var url = this.endpoint || this.base;
    var match = url.match(/%s/g);

    //if string of number
    if ((angular.isString(some) || angular.isNumber(some)) &&
      match &&
      match.length === 1)
    {
      url = url.replace(/%s/, some);
    }

    //if array
    if (angular.isArray(some) &&
      match &&
      match.length === some.length)
    {

      angular.forEach(some, function(item){
        url = url.replace(/%s/, item);
      });
    }

    this.endpoint = url;

    return this;
  };


  return Resource;
}