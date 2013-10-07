(function() {
	
	var ns = Jassa.sponate;
	
	ns.CriteriaCompilerSparql = Class.create({


		/**
		 * Generates 
		 * 
		 * The result is a SPARQL concept
		 * 
		 */
		compile: function(context, mapping, criteria) {
			var state = {
				context: context,
				mapping: mapping
			};
			
			var result = criteria.accept(this);

			return result;
		},
		
		findPattern: function(attrPath) {
			
		},
		
		
		visitElemMatch: function() {
			
		},

		
		visitGt: function() {
			
		}
		
	});
	
	
})();