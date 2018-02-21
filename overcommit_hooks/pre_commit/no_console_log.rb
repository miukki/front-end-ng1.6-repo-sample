module Overcommit::Hook::PreCommit
  class NoConsoleLog < Base
    def run
      errors = []
      applicable_files = Dir['app/**/*.js'] + Dir['test/**/*.js']

      applicable_files.each do |file|
        if File.open(file).each_line.any?{|line| line.match(/console\./)}
          errors << "#{file}: Please don't insert any console log or info in your code"
        end
      end

      return :fail, errors.join("\n") if errors.any?

      :pass
    end
  end
end