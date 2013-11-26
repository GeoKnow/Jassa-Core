(function() {

	var ns = Jassa.service;

	// Not done yet... Should enable executing a query constrained by an array of bindings
	
	ns.PreparedExecutor = Class.create({
		initialize: function(queryExecutionFactory, query) {
			this.qef = queryExecutionFactory;
			this.query = query;
		},
		
		execute: function(bindings) {
			var copy = query.clone();
			
			
		}
	});
	
})();
