// Move some utility functions from Elements here
(function() {
	
	var ns = Jassa.sparql;

	/**
	 * Another class that mimics Jena's behavour.
	 * 
	 * @param prefix
	 * @param start
	 * @returns {ns.GenSym}
	 */
	ns.GenSym = function(prefix, start) {
		this.prefix = prefix ? prefix : 'v';
		this.nextValue = start ? start : 0;
	};
	
	ns.GenSym.prototype.next = function() {
		++this.nextValue;
		
		var result = this.prefix + "_" + this.nextValue;
		
		return result;
	};


	/**
	 * 
	 * @param generator
	 * @param blacklist Array of strings
	 * @returns {ns.GeneratorBlacklist}
	 */
	ns.GeneratorBlacklist = function(generator, blacklist) {
		this.generator = generator;
		this.blacklist = blacklist;
	};
	
	ns.GeneratorBlacklist.prototype = {
		next: function() {
			var result;
			
			do {
				result = this.generator.next();
			} while(_(this.blacklist).contains(result));
				
			return result;
		}
	};

})();