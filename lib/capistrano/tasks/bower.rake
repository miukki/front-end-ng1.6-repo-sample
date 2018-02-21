namespace :bower do
  desc "We do a bower install in current release"
  task :install do
  	on roles(:all) do
      execute "ssh-add"
      execute "cd #{release_path}; bower install --force"
    end
  end

  desc "We update global asset"
  task :update do
  	on roles(:all) do
      execute "cd #{release_path}; bower update ui-assets-repo-sample"
    end
  end

  desc "We do a bower install in the global assets share folder"
  task :install_global_assets do
  	on roles(:all) do
      execute "cd #{fetch(:global_assets_path)}; bower install --production"
    end
  end
end
