/**
 * @ngdoc service
 * @name AppWeb.service:jsonSchemaValidationService
 * @requires tv4
 * @description jsonSchemaValidationService
 **/
angular
  .module('AppWeb')
  .service('jsonSchemaValidationService', jsonSchemaValidationService);

jsonSchemaValidationService.$inject = ['tv4', 'lodash', 'utilsService', '$compile', '$templateCache', '$http', 'Resource'];

function jsonSchemaValidationService (tv4, _, $utils, $compile, $templateCache, $http, Resource) {
  'use strict';
  /* jshint validthis:true */
  var registry = {}, API_SCHEMA_DEF = 'data/definitions.schema.json';

  this.getSchemaDef = function(){
    return $http.get(API_SCHEMA_DEF).then((new Resource()).respHandler);
  };

  tv4.addFormat({
    'positive': function(data) {
	    if (+data>0) {
        return;
      }
      return true;
    },
    'pdfextension': function(data) {
	    if ((typeof data === 'string' || data instanceof String) && /\.(pdf)$/i.test(data)) {
        return;
      }
      return 'File type must be PDF';
    },
    'docextension': function(data) {
      if ((typeof data === 'string' || data instanceof String) && (/\.(doc)$/i.test(data) || /\.(docx)$/i.test(data))) {
        return;
      }
      return 'File type must be a Doc or docx fle';
    },
    'datetime': function(date){
	    if (Object.prototype.toString.call(date) === '[object Date]') {
        return;
      }
      return 'Invalid Date!';

    }
  });

  this.addFormFields = function(tmpls, scope, element) {

    tmpls = $utils.isString(tmpls) ? tmpls.split(','): [];
    var html = '';

    if (tmpls.length) {
      angular.forEach(tmpls, function(tmplUrl){

        tmplUrl = tmplUrl.replace(new RegExp('\\s', 'g'), '');
        html = String.prototype.concat(html, $templateCache.get(tmplUrl));

      });

      var template = angular.element(html);
      element.append(template);
      $compile(template)(scope);

    }

  };

  /**
   * @ngdoc method
   * @name AppWeb.service:jsonSchemaValidationService#isRegistered
   * @methodOf AppWeb.service:jsonSchemaValidationService
   * @description
   * Check if a specific key is registered
   *
   * @param  {string} name  Registry key
   * @returns {boolean}     If the association identified by the key is registered
   */
  this.isRegistered = function(name) {
    return _.has(registry, name);
  };

  /**
   * @ngdoc method
   * @name AppWeb.service:jsonSchemaValidationService#register
   * @methodOf AppWeb.service:jsonSchemaValidationService
   * @description
   * Associate a set of fields with a schema
   *
   * @param  {string} name    The association key
   * @param  {object} model   The model to validate
   * @param  {object} schema  The JSON schema to validate against
   * @param  {array}  fields  An array of ngModelController. Only errors related to these fields will be reported
   */
  this.register = function(name, model, schema, fields, defs) {
    registry[name] = {
      model: model,
      schema: schema || {},
      fields: fields,
      defs: tv4.getSchema('defs')
    };

    //defs
    tv4.addSchema(defs || {});
    tv4.addSchema('basic-schema-'+name, registry[name].schema);
    var map = tv4.getSchemaMap();
    
    var prop = registry[name].schema && registry[name].schema.properties, fieldsN = registry[name].fields;
    var requiredFields = registry[name].schema && registry[name].schema.required;
    
    // convert schema rules to names. tv4 doesn't allow regexp rules ^file_tag_size[0-9]+$
    // e.g "^file_tag_size[0-9]+$": {} -> file_tag_size1: {}, file_tag_size2: {} ..
    if (prop && Object.prototype.toString.call(prop) === '[object Object]') {
      _.forEach(/\^/.test(Object.keys(prop).join('')) && prop || [], function(val, key){
        if (/\^/.test(key) && angular.isArray(fieldsN)) {
          _.forEach(fieldsN, function(f){
            addToSchemaDynamicFiels(key, f);
            setDynamicProp(key, val, f);
          });
        }

      });
    }
    function setDynamicProp (key, val, f) {
      if (new RegExp(key).test(f.key) && requiredFields.indexOf(f.key) > -1){
        prop[f.key] = val;
      } else if (requiredFields.indexOf(f.key) === -1) {
        delete prop[f.key];
      }
    }
    function addToSchemaDynamicFiels(key, f) {
      if (new RegExp(key).test(f.key) && requiredFields.indexOf(f.key) === -1) {
        registry[name].schema.required.push(f.key);
      }
    }

  };

  /**
   * @ngdoc method
   * @name AppWeb.service:jsonSchemaValidationService#validate
   * @methodOf AppWeb.service:jsonSchemaValidationService
   * @description
   * Validate a set of fields
   *
   * @param  {string} name The association key
   */
  this.validate = function(name) {

    if (!this.isRegistered(name)) {
      return;
    }

    var target = registry[name];
    var result = tv4.validateMultiple(target.model, 'basic-schema-'+name);
    var relatedErrors = [];
    /*jshint -W087 */
    _.forEach(target.fields, function(field) {

      var relatedError = !field.isExcluded && _.find(result.errors, function(error) {

        var fieldKeyInSchema = target.schema.properties && field.key && target.schema.properties[field.key];
        var ref = fieldKeyInSchema && fieldKeyInSchema.$ref;
        var defField = ref && ref.split('/')[2];
        var defFieldMessage = defField &&  target.defs && target.defs.props[defField];

        // schemaMessage error
        error.schemaMessage = fieldKeyInSchema && fieldKeyInSchema.message;
        // formatMessage error (custom format)
        error.formatMessage = error.params && error.params.message;
        // defFieldMessage error
        error.defFieldMessage = defFieldMessage && defFieldMessage.message; 

        if (error.dataPath && (_.includes(error.schemaPath.split('/'), 'required') === false)) {
          return _.includes(error.dataPath.split('/'), field.key);
        }
        
        return error.params && error.params.key === field.key;

      });


      if (relatedError) {
        relatedErrors.push(relatedError);
        //1 - formatMessage error
        //2 - schemaMessage error
        //3 - tv4 generated error
        field.value.message = relatedError.formatMessage || relatedError.schemaMessage || relatedError.defFieldMessage || relatedError.message;

        field.value.$setValidity('schema', false);
      } else {
        field.value.$setValidity('schema', true);
      }

    });

    //result
    return !relatedErrors.length ? {valid: true} : { valid: false };

  };
}
