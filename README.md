## Basic project setup

#### Setup project:

```
yarn install
bower i
```

### Local server run:
```
grunt server --env=[dev]
```

### Release bundle using capistrano script

```
bundle exec cap staging deploy
```


#### Test Release bundle (with Python server):

1. Test dist/
requirements: python env (Python 2.7.11 or higher).

```
grunt release --env=staging 
pushd ./dist; python -m SimpleHTTPServer 9000; popd #v 2.*
pushd ./dist; python -m http.server 9000; popd #v 3.*

```


### Tests:
#### Unit testing:

```
bower i
yarn install
#yarn run test
#you can call karma if bower, yarn assets are ready
karma start test/karma.conf.js --log-level debug 

```

#### e2e Protractor test
```
#run test e.g for local env
protractor test/protractor/conf.js
```


### yarn

#### set yarn chinese source
```
$ yarn config get registry

$ yarn config set registry 'https://registry.npm.taobao.org'
```


Documentation: https://github.com/angular/angular.js/wiki/Writing-AngularJS-Documentation

### Vorlon:

- ```vorlon```

- ```grunt server --env=dev```
source: http://www.vorlonjs.io/documentation/#vorlonjs-client-advanced-topics

