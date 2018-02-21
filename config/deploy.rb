# config valid only for current version of Capistrano
lock '3.6.1'

set :application, 'app'
set :repo_url, 'git@github.com:miukki/front-end-ng1.6-repo-sample.git'

set :deploy_to, '/home/static/app'

set :linked_dirs, fetch(:linked_dirs, []).push('node_modules', 'bower_components')

set :linked_files, fetch(:linked_files, []).push('yarn.lock')

set :keep_releases, 2

set :global_assets_path, "#{shared_path}/bower_components/ui-assets-repo-sample"

namespace :deploy do

  after :updated, "yarn:install_dependencies_first"
  after :updated, "yarn:install"
  after :updated, "bower:install"
  # after :updated, "bower:update"
  after :updated, "yarn:install_global_assets"
  after :updated, "bower:install_global_assets"
  after :updated, "grunt:compile_global_assets"
  after :updated, "grunt:release"
  after :updated, "new_relic:link"
  after :finished, "nginx:reload"

end
