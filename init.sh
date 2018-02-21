#!/bin/bash

init_env(){
  cd ../
  if [ ! -d "ui-assets-repo-sample" ]; then
    git clone git@github.com:miukki/ui-assets-repo-sample.git
  else
    echo "ui-assets-repo-sample alredy exits"
  fi
  cd ui-assets-repo-sample
  # git checkout static
  # git pull origin static
  npm i && bower i && yarn install --production && npm install node-sass
  PROJECT=:project yarn run sass && yarn run prefixer
  # bower link
  echo "we are leaving ui-assets-repo-sample"
  cd ..
  cd /project
  # git checkout develop
  # git pull origin develop
  yarn install && bower install  
  bower link ui-assets-repo-sample
}

init_env
