require('dotenv').config();
var webServerDefaultPort = 8081;

module.exports = {
  // The address of a running selenium server.
  seleniumAddress: (process.env.SELENIUM_URL || 'http://localhost:4444/wd/hub'),

  // Capabilities to be passed to the webdriver instance.
  // This is for saucelab
  // capabilities: {
  //    browserName: 'chrome',

  //    tunnel-identifier: 'poutre',

  //    build: 12345,

  //    name: 'FUNCTIONAL TEST APP'
  // },
  // This is for crossbrowsertesting
  capabilities : {

    name: 'FUNCTIONAL TEST APP', // this will show up in the UI
    // these are important :)
    // browser_api_name : 'chrome', // change this according to what browser you are using
    // os_api_name : 'WinXPSP2-C2', // change this for the OS you are using
    // screen_resolution : '1024x768', // change this for the resolution
    // 
    browserName: 'chrome',
    record_video : true,
    record_network : false,
    record_snapshot : false,
    // change this to your USERNAME and AUTHKEY
    username :  process.env.CROSSBROWSERTESTING_USERNAME, 
    password : process.env.CROSSBROWSERTESTING_PASSWORD
  },
  // This is for browserstack
  // capabilities: {
  //   'browserstack.user': process.env.BROWSERSTACK_USERNAME,
  //   'browserstack.key': process.env.CROSSBROWSERTESTING_USERNAME,
  //   'browserName': 'chrome'
  // }

  // Default http port to host the web server
  webServerDefaultPort: webServerDefaultPort,

  // Protractor interactive tests
  interactiveTestPort: 6969,

  // A base URL for your application under test.
  baseUrl:'http://' + (process.env.HTTP_HOST || 'localhost') 

};