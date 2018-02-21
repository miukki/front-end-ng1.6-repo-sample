
describe('Controller: AdditionalContractTemplatesController', function() {
    'use strict';

    var httpBackend, templateCache, uidModalInstance, DATA = window.__fixtures__['test/fixtures/data'], scope, compile, AdditionalContractTemplatesController;

    beforeEach(function(){
        module('AppWeb');
    });

    beforeEach(inject(function($controller, _serviceBus_, $q, $rootScope, $httpBackend, Constant, $compile, $templateCache, $filter) {
      DATA.API = Constant.API;
      compile = $compile;
      scope = $rootScope.$new();
      httpBackend = $httpBackend;
      templateCache = $templateCache;//.get('url');

      uidModalInstance = jasmine.createSpyObj('$uibModalInstance', ['close', 'dismiss']);

      var CartModalCounsellingController = $controller('CartModalCounsellingController as main', {
        $scope: scope,
        context: {},
        $uibModalInstance: uidModalInstance,
        additionalTermsValues: [{
          additional_term_id: 7, additional_term: {template_type_id: 7}, content: '', contracts_product_id: 148, values: {additional_term_id:1, values: {integer_1:'3', moneypercentage_1: 'RMB'} }
        }]
      });


      scope.$parent.main = CartModalCounsellingController;
      angular.extend(scope.$parent.main, {
        order: {id: 1},
        _data: {},
        selectedProduct: DATA.selectedProduct,
        selectedProductDetailsFiltered: DATA.selectedProductDetailsFiltered,
        modal_counselling: window.__fixtures__['app/data/modal.counselling.schema'],
        contracts_product: {},
        contract_id: '258041',
        additionalTermsValues: [{
          additional_term_id: 7, additional_term: {template_type_id: 7}, content: '', contracts_product_id: 148, values: {additional_term_id:1, values: {integer_1:'3', moneypercentage_1: 'RMB'} }
        }]
      });

      AdditionalContractTemplatesController = $controller('AdditionalContractTemplatesController as terms', {
        serviceBus: _serviceBus_,
        $scope: scope,
        _data: {},
        $filter: $filter,
        context: {}

      });


    }));

    it('test render terms , test self.getAdditionalTerms()', function() {
      var self = AdditionalContractTemplatesController;
      var tmplBody = templateCache.get('contract/form/terms.tmpl');
      var compiled = compile(angular.element(tmplBody))(scope);


      var url = DATA.API + '/picklists/orders/'+self.order.id+'/additional_terms';
      httpBackend.whenGET(url).respond(function() {
        var response = DATA.contract_templates;
        response[0].additional_terms = DATA.additional_terms;
        return [200, response, {}];
      });


      scope.$digest();
      httpBackend.flush();

      expect(compiled[0].querySelectorAll('.content-box.panel')).not.toBe(undefined);
      expect(self.additionalContractTemplates.length).not.toBe(0);

      //compile item.additional_terms
      expect(compiled[0].querySelectorAll('.row')[0]).not.toBe(undefined);

      //basic_term is fired
      expect(!self._.isEmpty(self._data.terms)).toBe(true);

    });

    it('test additionalTermsValues.length !==0, call self.presetValuesForEachTerm()', inject(function($q){
      var self = AdditionalContractTemplatesController;
      scope.$parent.main.mode = 'PATCH';

      self.serviceBus.contracts.getOrderContract =  jasmine.createSpy('getOrderContract').and.callFake(function(){
        var deferred = $q.defer();
        deferred.resolve(
          {contracts_products:
            [
              {product_id: DATA.selectedProduct.id, contracts_products_additional_terms: DATA.additional_terms}
            ]
          });
        return deferred.promise;
      });

      var tmplBody = templateCache.get('contract/form/terms.tmpl');
      compile(angular.element(tmplBody))(scope);


      var url = DATA.API + '/picklists/orders/'+self.order.id+'/additional_terms';
      httpBackend.whenGET(url).respond(function() {
        return [200, { data: DATA.contract_templates }, {}];
      });

      scope.$digest();

      httpBackend.flush();
      scope.$digest();
      expect(self._.isEmpty(self._data.terms)).toBe(false);

    }));

  });


