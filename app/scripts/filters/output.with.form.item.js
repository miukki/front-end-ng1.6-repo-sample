angular
  .module('AppWeb')
  .filter('ouputWithFormItem', ouputWithFormItem);

ouputWithFormItem.$inject = ['lodash', 'Constant', 'Resource', '$templateCache', '$rootScope', '$compile'];

function ouputWithFormItem (_, Constant, Resource, $templateCache, $rootScope, $compile) {
  'use strict';

  return function(input, tmplUrl, itemId, termId) {

    //006p0000004jdjz

    var scope = $rootScope.$new();

    var outputFullPath, output, option = _.map(Constant.config.terms_form, function(i){
      var resc = new Resource('%s'+i+'%s').replace(['\\W?', '_\\d+\\W?']);
      return resc.endpoint;
    }).join('|');

    var rgx = new RegExp(option,'ig');

    var match = input.match(rgx), out = '';

    _.map(match, function(result){

      var tmplName = result.replace(/\W|\d|_/g, ''),
      ngModelTarget = result.replace(/\W/g, ''),
      fullPath = tmplName + '.tmpl',
      tmplBody =  $templateCache.get(tmplUrl + fullPath),
      targetName = ngModelTarget+'_'+itemId+'_'+termId;

      angular.extend(scope,
        {model: 'terms._data.terms['+itemId+'].terms['+termId+'].values.'+ngModelTarget}, 
        {name: targetName}, 
        {itemId: itemId}, 
        {termId: termId},
        {change: 'terms.updateModelTerms(\''+targetName+'\',\''+ngModelTarget+'\', '+termId+', '+itemId+'); terms.serviceBus.validate(form.$name);'}
      );

      var updatedTmpl = $compile(tmplBody)(scope).html();

      input = input.replace(result, updatedTmpl || 'not found');

    });
    
    return input || '';
  };
}
