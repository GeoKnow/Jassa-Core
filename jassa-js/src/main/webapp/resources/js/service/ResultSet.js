(function() {
	
	var util = Jassa.util;
	var ns = Jassa.service;
	
	
	ns.ResultSet = Class.create(util.Iterator, {
		
	});
	
	/**
	 * Resultset based on an array of bindings
	 * 
	 * Converts a plain json result set to an array of bindings...
	 * 
	 * TODO This class already exists somewhere in Sponate...
	 */
	ns.ResultSetArrayIteratorBinding = Class.create(ns.ResultSet, {
		initialize: function(itBinding) {
			this.itBinding = itBinding;
		},
		
		hasNext: function() {
			return this.itBinding.hasNext();
		},
		
		next: function() {
			return this.nextBinding();
		},
		
		nextBinding: function() {
			return this.itBinding.next();
		},
		
		// Return the binding array
		getBindings: function() {
			return this.itBinding.getArray();
		}
	});
	
	
})();
