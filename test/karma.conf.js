// Karma configuration
// Generated on Wed Jul 20 2016 14:53:24 GMT+0800 (CST)
//process.env.PHANTOMJS_BIN = './node_modules/.bin/phantomjs';

module.exports = function(config) {
  'use strict';
  config.set({


    // base path that will be used to resolve all patterns (eg. files, exclude)
    basePath: '../',


    // frameworks to use
    // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
    frameworks: ['jasmine'],


    // list of files / patterns to load in the browser
    files: [
      // bower:js
      'bower_components/angular/angular.js',
      'bower_components/angular-animate/angular-animate.js',
      'bower_components/angular-route/angular-route.js',
      'bower_components/spin.js/spin.js',
      'bower_components/angular-spinner/angular-spinner.js',
      'bower_components/angular-resource/angular-resource.js',
      'bower_components/ng-lodash/build/ng-lodash.js',
      'bower_components/tv4/tv4.js',
      'bower_components/angular-sanitize/angular-sanitize.js',
      'bower_components/angular-smart-table/dist/smart-table.js',
      'bower_components/angular-filter/dist/angular-filter.js',
      'bower_components/angular-bootstrap/ui-bootstrap.js',
      'bower_components/angular-mocks/angular-mocks.js',
      // endbower

      'node_modules/pusher-js/dist/web/pusher.js',
      
      'app/data/**/*.json',
      'test/fixtures/data.json',
      'app/scripts/**/*.js', //tmpls is here too
      'test/spec/**/*.js'
    ],


    // list of files to exclude
    exclude: [
      'app/scripts/generated/constants.js'
    //'app/scripts/generated/*.js'
    ],


    // preprocess matching files before serving them to the browser
    // available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
    preprocessors: {
      'app/data/*.schema.json': ['json_fixtures'],
      'test/fixtures/data.json': ['json_fixtures'],
      'app/scripts/**/*.js': ['coverage'],
    },

    jsonFixturesPreprocessor: {
      //stripPrefix: 'app/data/'
      transformPath: function(path) {
        return path;
      }
    },

    // test results reporter to use
    // possible values: 'dots', 'progress'
    // available reporters: https://npmjs.org/browse/keyword/karma-reporter
    reporters: ['progress', 'coverage', 'karma-remap-istanbul'],//clear-screen

    coverageReporter: {

      instrumenterOptions: {
        istanbul: { noCompact: true }
      },

      reporters: [
        { type: 'html', subdir: 'report-html' },
        { type: 'lcov', subdir: 'report-lcov' },

        { type: 'cobertura', subdir: '.', file: 'cobertura.txt' },
        { type: 'lcovonly', subdir: '.', file: 'report-lcovonly.txt' },
        { type: 'teamcity', subdir: '.', file: 'teamcity.txt' },
        { type: 'text', subdir: '.', file: 'text.txt' },
        { type: 'text-summary', subdir: '.', file: 'text-summary.txt' }

      ],
      check: {
        global: {
          statements: 10,
          lines: 10,
          functions: 10,
          branches: 10
        }
      }


    },

/*
   for setting up TypeScript, coffee
   remapIstanbulReporter: {
      src: 'coverage/coverage.json',
      reports: {
        html: 'coverage'
      },
      timeoutNotCreated: 1000,
      timeoutNoMoreFiles: 1000
    },

*/

    // web server port
    port: 9876,


    // enable / disable colors in the output (reporters and logs)
    colors: true,


    // enable / disable watching file and executing tests whenever any file changes
    autoWatch: true,

    // Which plugins to enable
    plugins: [
      "karma-json-fixtures-preprocessor",
      "karma-phantomjs-launcher",
      "karma-jasmine",
      "karma-coverage",
      "karma-remap-istanbul",
      "karma-chrome-launcher"
    ],

    // start these browsers
    // available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
    // browsers: ['PhantomJS'],
    browsers: ['Chrome'],
    // browsers: ['ChromeHeadless'],


    // Continuous Integration mode
    // if true, Karma captures browsers, runs the tests and exits
    singleRun: false,

    // level of logging
    // possible values: LOG_DISABLE || LOG_ERROR || LOG_WARN || LOG_INFO || LOG_DEBUG
    logLevel: config.LOG_INFO,

    // Concurrency level
    // how many browser should be started simultaneous
    concurrency: Infinity
  });
};
