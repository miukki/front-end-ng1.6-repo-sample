angular
  .module('AppWeb')
  .filter('productName', productName);

productName.$inject = ['lodash'];

function productName (_) {
  'use strict';

  var norm = function (name) {//refactor: fix if name has backspace (a few words) 
    if (/\W|_/g.test(name)){
      return name.replace(/\W|_|(\\)?/g, '[$&]');
    }
    return name;
  };

  return function(input, name) {

    name = norm(name);

    var regName = new RegExp(name, 'g');

    var filtered = _.filter(input, function(item) {
      if (name) {
        return regName.test(item.name);
      }
      return true;
    });

    return filtered;

  };
}
