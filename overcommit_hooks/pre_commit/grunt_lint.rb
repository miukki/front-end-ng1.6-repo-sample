
module Overcommit::Hook::PreCommit
  class GruntLint < Base
  	def run
  		result = execute(%w[grunt lint])
  		if result.stdout =~ /Aborted due to warnings/
  			return :fail, result.stdout
  		end
  		:pass
  	end

  end
end