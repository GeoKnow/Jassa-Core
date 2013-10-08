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

	ns.fnToString = function(x) {
		return x.toString();
	};

	ns.fnGetVarName = function(x) {
		return x.getName();
	};


	ns.ElementUtils = {
		flatten: function(elements) {
			var result = _.map(elements, function(element) { return element.flatten(); });

			return result;
		},
		
		
		/**
		 * Rename all variables in b that appear in a.
		 * 
		 */
		makeElementDistinct: function(a, b) {
			var vas = a.getVarsMentioned();
			var vbs = b.getVarsMentioned();

			var vans = vas.map(ns.fnGetVarName);
			var vbns = vbs.map(ns.fnGetVarName);
			
			// Get the var names that are in common
			var vcns = _(vans).intersection(vbns);
			
			var g = new ns.GenSym('v');
			var gen = new ns.GeneratorBlacklist(g, vans);

			// Rename all variables that are in common
			var rename = {};

			_(vcns).each(function(vcn) {
				var newName = gen.next();
				var newVar = ns.Node.v(newName);
				rename[vcn] = newVar;
			});
			
			console.log('Common vars: ' + vcns + ' rename: ' + JSON.stringify(rename));
			
			var fnSubst = function(v) {
				var result = rename[v.getName()];
				return result;
			};
			
			//debugger;
			var newElement = b.copySubstitute(fnSubst);
			
			var result = {
				map: rename,
				element: newElement
			};
			
			return result;
		}
	};

	
})();