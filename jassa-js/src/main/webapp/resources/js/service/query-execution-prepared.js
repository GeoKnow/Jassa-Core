(function() {

	var ns = Jassa.service;

	// Not done yet... Should enable executing a query constrained by an array of bindings
	
	
	ns.SparqlCacheSingleVar = Class.create({
	    
	});
	
	/**
	 * 
	 * ISSUE At present prepared executor is bound to only a single sparql service - what's the best way to make it work with dynamic services? 
	 */
	ns.PreparedExecutor = Class.create({
		initialize: function(sparqlService, query) {
		    this.sparqlService = sparqlService;
			this.query = query;
		},
		
		execute: function(bindings) {
		    var sparqlService = this.sparqlService; 

			var copy = this.query.clone();
			
		}
	});
	
})();
