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
			
			console.log('crit', criteria);
			
			var result = criteria.accept(this);

			return result;
		},
		
		
		findPattern: function(pattern, attrPath) {

			// At each step check whether we encounter a reference
			_(attrPath.getSteps()).each(function(step) {
				pattern.find();
				
			});
		},
		
		
		visitElemMatch: function(criteria) {
			
			alert('yay' +  JSON.stringify(criteria));
		},

		
		visitGt: function() {

		},
		
		visitLogicalOr: function() {
			
		}
		
	});
	
	
})();