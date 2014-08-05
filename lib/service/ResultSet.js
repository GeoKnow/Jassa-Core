(function() {
	
	var util = Jassa.util;
	var ns = Jassa.service;
	
	
	ns.ResultSet = Class.create(util.Iterator, {
		getVarNames: function() {
		    throw 'Override me';
		}
	});
	
	/**
	 * Resultset based on an array of bindings
	 * 
	 * Converts a plain json result set to an array of bindings...
	 * 
	 * TODO This class already exists somewhere in Sponate...
	 */
	ns.ResultSetArrayIteratorBinding = Class.create(ns.ResultSet, {
		initialize: function(itBinding, varNames) {
			this.itBinding = itBinding;
			this.varNames = varNames;
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
		
		getVarNames: function() {
		    return this.varNames;
		},
		
		getBindings: function() {
		    return this.itBinding.getArray();
		},
		
		// Return the binding array
		getIterator: function() {
			//return this.itBinding.getArray();
		    return this.itBinding;
		}
	});
	
	
})();
