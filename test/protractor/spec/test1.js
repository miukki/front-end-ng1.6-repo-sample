var helpers = require('../helpers/login.js');
var json = require('../data.json');
var product = require('../helpers/product.js');
var OPPORTUNITY_ID = json.OPPORTUNITY_ID;
var discount = element(by.model('main._data.reverse_discount'));
const driver = browser.driver;

describe('Add new product', function(){
   //go to opportunity page and redirect to cart page
   it('go to #/opportunity/:ID, expect to be redirected to cart page', function(){
    browser.get(process.env.APP_URL+'/#/opportunities/'+OPPORTUNITY_ID);
    expect(browser.getCurrentUrl()).toContain(process.env.APP_URL+'/#/carts');
  });

   //show modal after click add button
   it('expect to show modal after click add product button', function(){
    element(by.css('[ng-click="main.addOrder()"]')).click();
    expect(element(by.className('modal-body')).isDisplayed()).toBe(true);
  });

   //add new counselling product with selecting first product
   it('expect to have counselling product', function(){
     product.addProd();
     element(by.css('[ng-click="main.addOrder()"]')).click();
     element.all(by.className('customRadio-label')).get(1).click();
     product.addProd();
     element(by.css('[ng-click="!spinnerActive && main.submit()"]')).click();
     element(by.css('[ng-click="$close()"]')).click();
     driver.sleep(2000);
     expect(element.all(by.repeater('contractItem in order.contracts track by $index')).get(0).isDisplayed());
     expect(element.all(by.repeater('contractItem in order.contracts track by $index')).get(1).isDisplayed());
  });

   //Log out as counsellor and login as cashier
   it('Log out as counsellor and login as cashier', function(){
    helpers.logout();
    helpers.loginCashier();
    browser.get(process.env.APP_URL+'/#/opportunities/'+OPPORTUNITY_ID);
    expect(browser.getCurrentUrl()).toContain(process.env.APP_URL+'/#/carts');
   });
 

});