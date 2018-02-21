
module Overcommit::Hook::PreCommit
  class GruntUnitTests < Base
  	def run
  		result = execute(%w[yarn run test])
  		if result.stdout =~ /Aborted due to warnings/
  			return :fail, result.stdout
  		end
  		:pass
  	end

  end
end