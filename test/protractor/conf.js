// conf.js
var env = require('./environment.js');

exports.config = {
  /*
   To comment this lines if you want to test it locally 
   To run the test on saucelab from your local you need to run this command line in another session
   bin/sc -u {{process.env.SAUCE_USERNAME}} -k {{process.env.SAUCE_ACCESS_KEY}} --tunnel-identifier 'poutre'
   after downloading the executable from here https://saucelabs.com/beta/tunnels
  */
  // sauceUser: process.env.SAUCE_USERNAME,
  // sauceKey: process.env.SAUCE_ACCESS_KEY,
  /*
  To comment this lines if you want to test it locally 
  This will only work if you are running webdriver-manager server in the same time
  For doing this, just run webdriver-manager start in another sessions
  */
  
  seleniumAddress: env.seleniumAddress,
  specs: ['spec/*.js'],
  framework: 'jasmine',
  capabilities: env.capabilities,
  allScriptsTimeout:300000,
  getPageTimeout: 300000,
  jasmineNodeOpts: {
    showColors: true,//Use colors in the command line report.
    defaultTimeoutInterval: 3000000
  }

};
