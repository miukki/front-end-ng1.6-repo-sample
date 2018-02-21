namespace :grunt do
  desc "We precompile the assets in the global assets share folder"
  task :compile_global_assets do
    on roles(:all) do
      execute "cd #{fetch(:global_assets_path)}; PROJECT=app yarn run sass; yarn run prefixer"
    end
  end

  desc "We precompile assets for app"
  task :release do
  	on roles(:all) do
      execute "cd #{release_path}; npm uninstall optipng-bin; npm install optipng-bin; grunt release --env=#{fetch(:stage)}"
    end
  end
end