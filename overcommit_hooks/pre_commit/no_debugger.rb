module Overcommit::Hook::PreCommit
  class NoDebugger < Base
    def run
      errors = []
      applicable_files = Dir['app/**/*.js'] + Dir['test/**/*.js']

      applicable_files.each do |file|
        if File.open(file).each_line.any?{|line| line.match(/debugger/)}
          errors << "#{file}: Please don't insert any debugger in your code"
        end
      end

      return :fail, errors.join("\n") if errors.any?

      :pass
    end
  end
end