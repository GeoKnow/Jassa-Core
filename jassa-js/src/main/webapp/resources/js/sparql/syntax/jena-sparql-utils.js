// Move some utility functions from Elements here
(function() {
	
	var col = Jassa.utils.collections;

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
		 * Returns a map that maps *each* variable from vbs to a name that does not appear in vas.
		 */
		createDistinctVarMap: function(vas, vbs, generator) {
			var vans = vas.map(ns.fnGetVarName);
			var vbns = vbs.map(ns.fnGetVarName);
			
			// Get the var names that are in common
			//var vcns = _(vans).intersection(vbns);
			
			if(generator == null) {
				var g = new ns.GenSym('v');
				generator = new ns.GeneratorBlacklist(g, vans);
			}

			// Rename all variables that are in common
			var result = new col.HashBidiMap(ns.fnNodeEquals);
			//var rename = {};

			_(vbs).each(function(oldVar) {
				var vbn = oldVar.getName();
				
				var newVar;
				if(_(vans).contains(vbn)) {
					var newName = generator.next();
					newVar = ns.Node.v(newName);
					
				} else {
					newVar = oldVar;
				}
				
				//rename[vcn] = newVar;
				
				// TODO Somehow re-use existing var objects... 
				//var oldVar = ns.Node.v(vcn);
				
				result.put(oldVar, newVar);
			});
			
			return result;
		},
		
		/**
		 * distinctMap is the result of making vbs and vas distinct
		 * 
		 * [?s ?o] [?s ?p] join on ?o = ?s
		 * 
		 * Step 1: Make overlapping vars distinct
		 * [?s ?o] [?x ?p] -> {?s: ?x, ?p: ?p}
		 * 
		 * Step 2: Make join vars common again
		 * [?s ?o] [?x ?s] -> {?s: ?x, ?p: ?s}
		 */
		createJoinVarMap: function(sourceVars, targetVars, sourceJoinVars, targetJoinVars, generator) {
			
			if(sourceJoinVars.length != targetJoinVars.length) {
				console.log('[ERROR] Cannot join on different number of columns');
				throw 'Bailing out';
			}
			
			var result = ns.ElementUtils.createDistinctVarMap(sourceVars, targetVars, generator);
			
			for(var i = 0; i < sourceJoinVars.length; ++i) {
				var sourceJoinVar = sourceJoinVars[i];
				var targetJoinVar = targetJoinVars[i];

				// Map targetVar to sourceVar 
				result.put(targetJoinVar, sourceJoinVar);
				//rename[targetVar.getName()] = sourceVar;
			}

			return result;
		},
		
		/**
		 * Var map must be a bidi map
		 */
		createRenamedElement: function(element, varMap) {
			var fnSubst = function(v) {
				var result = varMap.get(v);//[v.getName()];
				return result;
			};
			
			//debugger;
			var newElement = element.copySubstitute(fnSubst);
			
			return newElement;
		},

		
		/**
		 * Rename all variables in b that appear in the array of variables vas.
		 * 
		 * 
		 */
//		makeElementDistinct: function(b, vas) {
//			//var vas = a.getVarsMentioned();
//			var vbs = b.getVarsMentioned();
//
//			var vans = vas.map(ns.fnGetVarName);
//			var vbns = vbs.map(ns.fnGetVarName);
//			
//			// Get the var names that are in common
//			var vcns = _(vans).intersection(vbns);
//			
//			var g = new ns.GenSym('v');
//			var gen = new ns.GeneratorBlacklist(g, vans);
//
//			// Rename all variables that are in common
//			var rename = new col.HashBidiMap(ns.fnNodeEquals);
//			//var rename = {};
//
//			_(vcns).each(function(vcn) {
//				var newName = gen.next();
//				var newVar = ns.Node.v(newName);
//				//rename[vcn] = newVar;
//				
//				// TODO Somehow re-use existing var objects... 
//				var oldVar = ns.Node.v(vcn);
//				
//				rename.put(oldVar, newVar);
//			});
//			
//			console.log('Common vars: ' + vcns + ' rename: ' + JSON.stringify(rename.getMap()));
//			
//			var fnSubst = function(v) {
//				var result = rename.get(v);//[v.getName()];
//				return result;
//			};
//			
//			//debugger;
//			var newElement = b.copySubstitute(fnSubst);
//			
//			var result = {
//				map: rename,
//				element: newElement
//			};
//			
//			return result;
//		}
	};

	
})();