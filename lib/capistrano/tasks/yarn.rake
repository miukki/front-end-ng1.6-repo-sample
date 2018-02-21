namespace :yarn do
  desc "yarn install in the current release"
  task :install do
  	on roles(:all) do
  	  execute "cd #{release_path}; yarn install"
    end
  end

  desc "because something goes wrong during installation and make deployment failed"
  task :install_dependencies_first do
    on roles(:all) do
      execute "cd #{release_path}; yarn global add node-gyp gulp-imagemin"
    end
  end

  desc "yarn install on global assets"
  task :install_global_assets do
  	on roles(:all) do
      execute "cd #{fetch(:global_assets_path)}; yarn install --production; npm install node-sass"
    end
  end
end
