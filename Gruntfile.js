'use strict';
// for performance reasons we're only matching one level down:
// 'test/spec/{,*/}*.js'

module.exports = function(grunt) {

  // Time how long tasks take. Can help when optimizing build times
  require('time-grunt')(grunt);

  //load all tasks
  require('load-grunt-tasks')(grunt, {
    config: './package.json',
     scope: ['testing','staging','production'].indexOf(grunt.option('env')) > -1 ? ['dependencies'] : ['devDependencies', 'dependencies']
  });

  // Configurable env
  var env = grunt.option('env') || 'dev';

  grunt.initConfig({

    pkg: grunt.file.readJSON('package.json'),
    gruntConfig: grunt.file.readJSON('gruntConfig.json'),
    projectConfig: grunt.file.readJSON('projectConfig.json'),
    ext: '{html,htm,tmpl,tpl}',
    tmplsPath: '<%= gruntConfig.global_assets %>/tmpls',
	  tmplsBootstrapPath: '<%= gruntConfig.global_assets %>/tmpls/bootstrap/<%= gruntConfig.app.bootstrap.v%>',

    clean: {
      dist: {
        src: ['<%= gruntConfig.app.dist %>']
      },
      tmp: {
        src: ['<%= gruntConfig.app.tmp %>']
      },
      generated: {
        src: ['<%= gruntConfig.app.generated %>'+'/*.js']
      },
      docs: {
        src: ['<%= gruntConfig.app.docs %>']
      }

    },

    // Automatically inject Bower components into the app
    wiredep: {
      test: {
        devDependencies: true,
        src: '<%= karma.unit.configFile %>',
        ignorePath:  /\.\.\//,
        exclude: [/html5shiv/].concat([
          ///ng-rollbar/
        ])

      }

    },

    jshint: {
      options: {
        jshintrc: '.jshintrc'
      },
      app: {
        src: [
          '<%= gruntConfig.app.src %>/scripts/{,*/}*.js',
          '!<%= gruntConfig.app.src %>/scripts/generated/*.js'
        ]
      },
      gruntfile: {
        src: [
          'Gruntfile.js'
        ]
      },
      test: {
        options: {
          jshintrc: 'test/.jshintrc'
        },
	      src: ['test/spec/**/*.js']
      }
    },

    jscs: {
      options: {
        config: '.jscsrc',
        verbose: true
      },
      app: {
        src: [
          '<%= gruntConfig.app.src %>/scripts/{,*/}*.js',
          '!<%= gruntConfig.app.src %>/scripts/generated/*.js'
        ]
      },
      gruntfile: {
        src: [
          'Gruntfile.js'
        ]
      },
      test: {
	      src: ['test/spec/**/*.js']
      }
    },

    // Watches files for changes and runs tasks based on the changed files
    watch: {
      js: {
        // tasks: ['newer:jshint:app', 'newer:jscs:app'],
        files: ['<%= gruntConfig.app.src %>/scripts/**/*.js', '!<%= gruntConfig.app.src %>/scripts/generated/*.js'],
        options: {
          livereload: '<%= connect.options.livereload %>'
        }
      },
      gruntfile: {
        files: ['Gruntfile.js'],
        tasks: ['newer:jshint:gruntfile', 'newer:jscs:gruntfile'],
      },
      tmpls: {
        files: [
          '<%= tmplsPath %>/shared/**/*.<%= ext %>',
          '<%= tmplsPath %>/app/**/*.<%= ext %>',
          '!<%= tmplsPath %>/app/static/**/*.<%= ext %>',
          '<%= tmplsPath %>/bootstrap/<%= gruntConfig.app.bootstrap.v %>/**/*.<%= ext %>'
        ],

        tasks: [
          'loadRules:htmlhint',
          'newer:htmlhint:tmpls',
          'newer:jsbeautifier:tmpls',
          'newer:ngtemplates'
        ],
        options: {
          livereload: '<%= connect.options.livereload %>',
	        livereloadOnError: false
        }
      },
      livereload: {
        options: {
          livereload: '<%= connect.options.livereload %>'
        },
        tasks: [],
        files: [
          '<%= gruntConfig.app.src %>/index.html',
          '.tmp/images/{,*/}*.{png,jpg,jpeg,gif,webp,svg}'
        ]
      }
    },

    // Test settings
    karma: {
      unit: {
        configFile: 'test/karma.conf.js',
        singleRun: true
      }
    },


    jsbeautifier: {
      options: {
        mode: 'VERIFY_AND_WRITE', //VERIFY_ONLY
        //config: 'path/to/config/file',
        css: {
          indentChar: ' ',
          indentSize: 4
        },
        html: {
          braceStyle: 'collapse',
          indentChar: ' ',
          indentScripts: 'keep',
          indentSize: 2,
          maxPreserveNewlines: 10,
          preserveNewlines: true,
          unformatted: ['a', 'sub', 'sup', 'b', 'i', 'u'],
          wrapLineLength: 0,
          fileTypes: ['.html', '.tmpl', 'tmpl']
        }
      },
      tmpls: {
        src: [
          '<%= tmplsPath %>/shared/**/*.<%= ext %>',
          '<%= tmplsPath %>/app/**/*.<%= ext %>',
          '!<%= tmplsPath %>/app/static/**/*.<%= ext %>',
          '<%= tmplsPath %>/bootstrap/<%= gruntConfig.app.bootstrap.v %>/**/*.<%= ext %>'
        ]
      }

    },

    htmlhint: {
      options: {
        htmlhintrc: '.htmlhintrc'
      },
      tmpls: {
        options: {
          'doctype-first': false,
          'count-of-signle-quotes-equals-no-accept-odd-number': true
        },
        src: [
          '<%= tmplsPath %>/shared/**/*.<%= ext %>',
          '<%= tmplsPath %>/app/**/*.<%= ext %>',
          '!<%= tmplsPath %>/app/static/**/*.<%= ext %>',
          '<%= tmplsPath %>/bootstrap/<%= gruntConfig.app.bootstrap.v %>/**/*.<%= ext %>'
        ]
      }
    },

    copy: {
      index: {
        files: [{
          cwd: '<%= gruntConfig.app.src %>',
          src: 'index.html',
          dest: '<%= gruntConfig.dest.'+env+' %>',
          expand: true,
          flatten: true,
          filter: 'isFile'
        }]
      },
      assets: {
        files: [{
          cwd: '.',
          src: '<%= gruntConfig.global_bower %>/bootstrap-sass/assets/fonts/bootstrap/*',
          dest: '<%= gruntConfig.dest.'+env+' %>/fonts/bootstrap',
          expand: true,
          flatten: true,
          filter: 'isFile'
        },
        {
          cwd: '.',
          src: [
            '<%= gruntConfig.global_bower %>/font-awesome/fonts/*'
          ],
          dest: '<%= gruntConfig.dest.'+env+' %>/fonts/fa',
          expand: true,
          flatten: true,
          filter: 'isFile'
        },
        {
          cwd: '.',
          src: [
            '<%= gruntConfig.global_assets %>/fonts/*'
          ],
          dest: '<%= gruntConfig.dest.'+env+' %>/fonts',
          expand: true,
          flatten: true,
          filter: 'isFile'
        },{
          cwd: '<%= gruntConfig.global_assets %>/fonts/apps',
          src: ['*'],
          dest: '<%= gruntConfig.dest.'+env+' %>/fonts/apps',
          expand: true,
          flatten: true,
          filter: 'isFile'
        },{
          cwd: '<%= gruntConfig.global_assets %>/images',
          src: [
            'favicon.ico', '{,*/}*.svg', 'error-icon.png'
          ],
          dest: '<%= gruntConfig.dest.'+env+' %>/images',
          expand: true,
          flatten: true,
          filter: 'isFile'
        }]

      },
      jsmodules: {
        files: [{
          cwd: '<%= gruntConfig.global_assets %>/js/modules',
          src: ['*.js'],
          dest: '<%= gruntConfig.dest.dev %>/scripts/modules', //only dev dest
          expand: true,
          flatten: true,
          filter: 'isFile'
        }]
      },
      jsonschema: {
        files: [{
          cwd: '<%= gruntConfig.app.src %>/data',
          src: ['*.json'],
          dest: '<%= gruntConfig.dest.'+env+' %>/data',//only dev dest
          expand: true,
          flatten: true,
          filter: 'isFile'
        }]

      },
      concat: {
        files: [{
          cwd: '<%= gruntConfig.dest.dev %>/concat/scripts',
          src: ['*.js'],
          dest: '<%= gruntConfig.dest.'+env+' %>/scripts',//only dev dest
          expand: true,
          flatten: true,
          filter: 'isFile'
        }]

      }

    },

    connect: {
      options: {
        hostname: '0.0.0.0',
        base: ['.'],
        port: 9000,
        debug: true,
        useAvailablePort: true,
        middleware: function(){},
        livereload: 35729
      },
      livereload: {
        options: {
          open: true,
          nospawn: true,
          middleware: function(){}
        }
      }

    },

    ngconstant: {
      options: {
        name: 'Constant',
        dest: '<%= gruntConfig.app.generated %>/constants.'+(env === 'test' ? 'test.' : '')+'js',
        //wrap: '\'use strict\';\n\n{%= __ngModule %}',
        space: '  ',
        constants: {
          Constant: {
            url: {'logout': '/auth/logout'},
            timeToLive: 60*60*1000,
            config: '<%= projectConfig.config %>',
            stampAPI: 'https://' +'<%= gruntConfig.host.stampApi.'+env+' %>',
            API: 'https://' + '<%= gruntConfig.host.api.'+env+' %>' + '/app',
            launchpad: 'https://'+ '<%= gruntConfig.host.launchpad.'+env+' %>',
            lita: 'https://'+ '<%= gruntConfig.host.lita.'+env+' %>'
          }
        }
      },
      dist: {
        options: '<%= ngconstant.options %>'
      }
    },

    //rollbar
    processhtml: {
      rollbar: {
        options: {
          process: true,
          data: {
            rollbarAccessToken: '',
            git_sha: '',
            env: env
          }
        },
        files: {
          '<%= gruntConfig.app.generated %>/rollbar.js': '<%= gruntConfig.app.src %>/scripts/rollbar.js'
        }
      }
    },

    ngtemplates: {
      options: {
        htmlmin:  {
          collapseWhitespace: true
          //keepClosingSlash:true
          //collapseBooleanAttributes: true
        },

        standalone: true
      },

      main: {
        options: {
	        url: function(url) {
		        if (/app/.test(url)) {
              return url.replace(new RegExp('^'+grunt.config.get('tmplsPath')+'/app/'), '');
		        }
		        if (/shared/.test(url)) {
			        return url.replace(new RegExp('^'+grunt.config.get('tmplsPath')+'/'), '');
		        }
		        return url;
	        },

	        module: 'Tmpls'

        },
        cwd: '.',
        src:  [
          '<%= tmplsPath %>/app/**/*.<%= ext %>',
          '!<%= tmplsPath %>/app/static/**/*.<%= ext %>',

          //shared templates
          '<%= tmplsPath %>/shared/mobile/header.tmpl',
          '<%= tmplsPath %>/shared/layout.tmpl',
          '<%= tmplsPath %>/shared/directives/launchpad-panel.directive.<%= ext %>',
          '<%= tmplsPath %>/shared/directives/logout-panel.directive.<%= ext %>',
          '<%= tmplsPath %>/shared/directives/st-batch-pagination.<%= ext %>',
          '<%= tmplsPath %>/shared/error.<%= ext %>'
        ],
        dest:  '<%= gruntConfig.app.generated %>/tmpls.js'
      },

      bootstrap: {
        options: {
          url: function(url) {
            return url
		          .replace(new RegExp('^'+grunt.config.get('tmplsBootstrapPath')+'/'), 'uib/template/')
		          .replace('.tmpl', '.html');

          },
          module: 'TmplsBootstrap'

        },
        cwd: '.',
        src:  [
          '<%= tmplsBootstrapPath %>/modal/{,*/}*.<%= ext %>',
          '<%= tmplsBootstrapPath %>/datepickerPopup/{,*/}*.<%= ext %>',
          '<%= tmplsBootstrapPath %>/datepicker/{,*/}*.<%= ext %>',
          '<%= tmplsBootstrapPath %>/tooltip/{,*/}*.<%= ext %>',
          '<%= tmplsBootstrapPath %>/tabs/{,*/}*.<%= ext %>',
          '<%= tmplsBootstrapPath %>/accordion/{,*/}*.<%= ext %>',
	        '<%= tmplsBootstrapPath %>/typeahead/{,*/}*.<%= ext %>'
        ],
        dest:  '<%= gruntConfig.app.generated %>/tmpls.bootstrap.js'
      }

    },

    filerev: {
      dist: {
        src: [
          '<%= gruntConfig.app.dist %>/scripts/{,*/}*.js',
          '<%= gruntConfig.app.dist %>/css/{,*/}*.css',
          '<%= gruntConfig.app.dist %>/images/{,*/}*.{png,jpg,jpeg,gif,webp,svg}',
          '<%= gruntConfig.app.dist %>/fonts/**/*.{eot,svg,ttf,woff,woff2,otf}'
        ]
      }
    },

	  uglify: {
		  generated: {
			  options: {
				  sourceMap: true
			  }
		  }
	  },

    useminPrepare: {
      html: '<%= gruntConfig.app.src %>/index.html',
      options: {
        dest: '<%= gruntConfig.app.dist %>',
        flow: {
          html: {
            steps: {
              js: ['concat', 'uglify'],
              css: ['cssmin']
            },
            post: {
              css: [{
                name: 'cssmin',
                createConfig: function (context, block) {
                  var generated = context.options.generated;
                  generated.options = {
                    shorthandCompacting: false,
                    roundingPrecision: -1,
                    keepSpecialComments: 0,
                    //compatibility: 'ie8', we dont support ie8 for that project
                    sourceMap: true,
                    restructuring: false

                  };
                }
              }]

            }
          }
        }
      }
    },

    usemin: {
      html: '<%= gruntConfig.dest.'+env+' %>/index.html',
      css: ['<%= gruntConfig.dest.'+env+' %>/css/{,*/}*.css'],
      js: ['<%= gruntConfig.dest.'+env+' %>/scripts/{,*/}*.js'],
      options: {
        assetsDirs: [
          '<%= gruntConfig.dest.'+env+' %>',
          '<%= gruntConfig.dest.'+env+' %>/images',
          '<%= gruntConfig.dest.'+env+' %>/css'

        ],
        patterns: {
          js: [[/(images\/[^''""]*\.(png|jpg|jpeg|gif|webp|svg))/g, 'Replacing references to images']]
        }
      }
    },

    // Run some tasks in parallel to speed up the build process
    concurrent: {
      dist: [
        'copy:assets',
        'imagemin',
        'svgmin'
      ],
      monitor: [
	      'watch'
        //'watch:js',
	      //'watch:tmpls'
        //'watch:livereload'
      ]

    },



    imagemin: {
      dist: {
        files: [{
          expand: true,
          cwd: '<%= gruntConfig.app.dist %>/images',
          src: [
            '{,*/}*.{ico,jpg,jpeg,png}'
          ],
          flatten: true,
          dest: '<%= gruntConfig.app.dist %>/images'
        }]
      }
    },

    svgmin: {
      dist: {
        files: [{
          expand: true,
          cwd: '<%= gruntConfig.app.dist %>/images',
          src: '{,*/}*.svg',
          dest: '<%= gruntConfig.app.dist %>/images'
        }]
      }
    },

    //addede to usemin process
    ngAnnotate: {
      options: {
        singleQuotes: true,
        separator: ';'
      },
      dist: {
        files: [{
          expand: true,
          cwd: '<%= gruntConfig.dest.dev %>/concat/scripts',
          src: 'scripts.min.js',
          dest: '<%= gruntConfig.dest.dev %>/concat/scripts'
          //rename: function (dest, src) { return src + '-annotated'; }
        }]
      }
    },

    prettify: {
      options: {
        indent: 2,
        brace_style: 'expand',
        unformatted: ['a', 'sub', 'sup', 'b', 'i', 'u']
      },
      html: {
        expand: true,
        cwd: '<%= gruntConfig.app.src %>',
        src: ['index.html'],
        ext: '.html',
        dest: '<%= gruntConfig.app.src %>'
      }
    },

    ngdocs: {
      all: ['app/**/*.js', '.tmp/scripts/modules/**/*.js']
    }


  });


  grunt.registerTask('rollbar', 'Compile rollbar config', function () {
    //Rollbar SetUp
    var git_sha = grunt.file.isFile('./REVISION') &&
    grunt.file.read('./REVISION', {encoding: 'utf8', preserveBOM: false}) || '';
    git_sha = git_sha.match(/[^\s]+/);

    var settings = 'processhtml.rollbar.options';

    var token = env ? '<%= gruntConfig.rollbar.' +env+ ' %>' : '';
    grunt.config.set(settings+'.data.rollbarAccessToken', token);
    grunt.config.set(settings+'.data.git_sha', git_sha);
    grunt.config.set('settings'+'.data.env', env);

    grunt.task.run(['processhtml:rollbar']);
  });

  grunt.registerTask('server', 'Run local server', function(arg1, arg2) {
    //clean
    grunt.task.run(['clean:tmp']);

    //js build
    grunt.task.run([
      'clean:generated',
      'ngconstant:dist',
      'rollbar',
      'ngtemplates',
	    'setMiddleware',
      'connect:livereload',
      'watch'
      //'concurrent:monitor'
    ]);

  });

  grunt.registerTask('release', 'Build release versions for --env[staging,testing,production]', function(arg1, arg2) {

    //clean
    grunt.task.run(['clean:tmp' ,'clean:dist']);

    //copy and minify assests
    grunt.task.run(['concurrent:dist']);

    //js build
    grunt.task.run([
      'clean:generated',
      'ngconstant:dist',
      'rollbar',
      'ngtemplates',
      'copy:jsonschema'
    ]); //ngAnnotate, watch

    //loginframe file prepare
    grunt.task.run(['copy:index']);

    //prepare usemin
    grunt.task.run(['postprocessing']);

  });


    grunt.registerTask('postprocessing', [
      'useminPrepare',
      'concat',
      'ngAnnotate',
      'copy:concat',
      'cssmin',
      'uglify',
      'filerev',
      'usemin'

    ]);

    grunt.task.registerTask('setMiddleware', 'set middleware', function(target) {


    //server
    var middleware = function(connect, options, middlewares) {

      var modRewrite = require('connect-modrewrite');
      var serveStatic = require('serve-static');
      return [].concat([].concat(
        connect().use('/',serveStatic('./app'))
      ), [
        modRewrite([
          'tmp .tmp [L]',
          'modules ./bower_components/ui-assets-repo-sample/assets/js/modules [L]',
          'scripts app/scripts [L]',
          'data app/data [L]',
          'css ./bower_components/ui-assets-repo-sample/.tmp/css [L]',
          'images ./bower_components/ui-assets-repo-sample/assets/images [L]',
          '/fonts/fa ./bower_components/font-awesome/fonts [L]',//fa-icons
          '/fonts/bootstrap ./bower_components/bootstrap-sass/assets/fonts/bootstrap [L]',//fonts/bootstrap/
          'pusher-js ./node_modules/pusher-js [L]' //pusher
      ])
      ], middlewares, [
        serveStatic('./bower_components/ui-assets-repo-sample/assets'),//for main fonts
      ]);


    }.bind(arguments);


      grunt.config.set('connect.livereload.options.middleware', middleware);

      //grunt.task.run(['connect:livereload', 'watch']);

    });


  grunt.registerTask('test:unit', 'Setup env for Unit test, Run Unit test', function(arg1, arg2) {


    //setup assets for unit tests
    grunt.task.run([
      'wiredep:test',
      'ngconstant:dist',
      'rollbar',
      'ngtemplates',
    ]);

    //run karma
    grunt.task.run(['karma']);

  });

  grunt.registerTask('loadRules:htmlhint', '', function() {
    require('./bower_components/ui-assets-repo-sample/htmlhint-rules/count-of-signle-quotes-equals-no-accept-odd-number').init();
  });

	grunt.registerTask('htmlLinter', ['loadRules:htmlhint', 'htmlhint:tmpls', 'jsbeautifier:tmpls']);


  grunt.registerTask('lint', [
    'prettify',
    'htmlLinter',
    'jshint',
    'jscs'
  ]);

  grunt.registerTask('docs', [
    'clean:docs',
    'ngdocs'
  ]);


};
