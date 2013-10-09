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
			var joinGraph = new ns.Graph(ns.fnCreateMappingJoinNode, ns.fnCreateMappingEdge);
			
			var joinNode = joinGraph.createNode(mapping);
			var result = criteria.accept(this, criteria, context, joinGraph, joinNode);

			return result;
		},
		
		
		findPattern: function(pattern, attrPath) {

			// At each step check whether we encounter a reference
			_(attrPath.getSteps()).each(function(step) {
				pattern.find();
			});
		},
		
		
		visitElemMatch: function(criteria, context, graph, joinNode) {
			
			var refSpec = criteria.getRefSpec();
			
			alert('yay' +  JSON.stringify(refSpec));
		},

		/**
		 * 
		 * 
		 */
		visitRef: function(criteria, context, graph, joinNode) {
			
		},


		visitGt: function() {

		},
		
		visitLogicalOr: function() {
			
		}
		
	});
	
	
})();