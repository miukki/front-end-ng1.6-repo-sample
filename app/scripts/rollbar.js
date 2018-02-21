/* <!-- build:template */
angular.module('AppWeb').config(['RollbarProvider',function(RollbarProvider) {
  var config = {

    //Global
    accessToken: '<%= rollbarAccessToken %>',
    captureUncaught: true,
    itemsPerMinute: 50, //The limit counts uncaught errors
    reportLevel: 'error',
    logLevel: 'warning',

    //Payload
    payload: {
      client: {
        javascript: {
          source_map_enabled: true,
          guess_uncaught_frames: true,
          code_version: '<%= git_sha %>' //// Git SHA of your deployed code
        }
      },
      environment: '<%= env %>'
      //context: route name, url, etc
    },

    //Context
    checkIgnore: function(isUncaught, args, payload) {
      // ignore all uncaught errors and all 'debug' items
      return isUncaught === true || payload.data.level === 'debug';
    },
    enabled: true,
    verbose: true


  };

  var env = config.payload.environment;

  if (env === 'staging' || env === 'production' || env === 'testing') {
    RollbarProvider.init(config);
  } else {
    //config.payload.environment == 'dev'
    RollbarProvider.deinit();
  }


}]);
/* /build --> */




