var env = require('../environment.js');
var json = require('../data.json');
var APP_USER_NAME = json.APP_USER_NAME;
var APP_USER_PASSWORD = json.APP_USER_PASSWORD;
var webdriver = require('selenium-webdriver'),
    By = webdriver.By,
    until = webdriver.until;
const driver = browser.driver;

var helpers = function helpers(){  
    this.login = function(){
        //set window size and navigate to the path where the template is loaded
        driver.manage().window().setSize(1500, 1000);
        driver.get(process.env.LOGIN_URL);
        //check if email field exists to see if the pop-up has been succesfully loaded
        driver.findElements(by.id('username')).then(found => !!found.length);
        //wait for pop-up fields to be displayed (they are on the page but might be hidden initially)
        driver.sleep(2000);
        //type credentials and click the 'access' button to log in
        driver.findElement(by.id('username')).sendKeys(APP_USER_NAME);
        driver.findElement(by.id('password')).sendKeys(APP_USER_PASSWORD);
        driver.findElement(by.id('Login')).click();
        driver.sleep(2000);
        //verify that the login was succesfull by checking if the logout button is displayed      
        driver.wait(function() {
            return driver.findElements(by.css('.logout.logout-group')).length != 0; 
        }, 5000);
    };


    this.logout = function(){
        driver.findElements(by.css('a.logout-item')).then(found => !!found.length);
        var logout = driver.findElement(by.css('a.logout-item'));
        logout.click();
        element(by.css('[ng-click="logout()"]')).click();
    };

    //login as cashier
    this.loginCashier = function(){
        driver.get(process.env.LOGIN_URL);
        driver.findElements(by.id('username')).then(found => !!found.length);
        driver.sleep(2000);
        driver.findElement(by.id('username')).sendKeys(APP_USER_NAME_CASHIER);
        driver.findElement(by.id('password')).sendKeys(APP_USER_PASSWORD);
        driver.findElement(by.id('Login')).click();
        driver.sleep(2000);    
        driver.wait(function() {
            return driver.findElements(by.css('.logout.logout-group')).length != 0; 
        }, 5000);
    };
};

module.exports = new helpers(); 