(function() {

	var util = Jassa.util;
	var sparql = Jassa.sparql;
	
	var ns = Jassa.facete;


	/**
	 * TODO Possibly rename to constraint list
	 * 
	 * A constraint manager is a container for ConstraintSpec objects.
	 * 
	 * @param cefRegistry A Map<String, ConstraintElementFactory>
	 */
	ns.ConstraintManager = Class.create({
	    classLabel: 'jassa.facete.ConstraintManager',
	    
		initialize: function(constraints) {
			
//			if(!cefRegistry) {
//				cefRegistry = ns.createDefaultConstraintElementFactories(); 
//			}
			
			//this.cefRegistry = cefRegistry;
			this.constraints = constraints || [];
		},
		
		/**
		 * Returns a new constraintManager with a new array of the original constraints
		 */
		shallowClone: function() {
		    var result = new ns.ConstraintManager(this.constraints.slice(0));
		    return result;
		},

		/**
		 * Yields all constraints having at least one
		 * variable bound to the exact path
		 * 
		 * Note: In general, a constraint may make use of multiple paths
		 */
		getConstraintsByPath: function(path) {
			var result = [];
			
			var constraints = this.constraints;
			
			for(var i = 0; i < constraints.length; ++i) {
				var constraint = constraints[i];
				
				var paths = constraint.getDeclaredPaths();
				
				var isPath = _.some(paths, function(p) {
					var tmp = p.equals(path);
					return tmp;
				});
				
				if(isPath) {
					result.push(constraint);
				}
			}
			
			return result;
		},
		

		getConstrainedSteps: function(path) {
			//console.log("getConstrainedSteps: ", path);
			//checkNotNull(path);
			
			var tmp = [];
			
			var steps = path.getSteps();
			var constraints = this.constraints;
			
			for(var i = 0; i < constraints.length; ++i) {
				var constraint = constraints[i];
				//console.log("  Constraint: " + constraint);

				var paths = constraint.getDeclaredPaths();
				//console.log("    Paths: " + paths.length + " - " + paths);
				
				for(var j = 0; j < paths.length; ++j) {
					var p = paths[j];
					var pSteps = p.getSteps();
					var delta = pSteps.length - steps.length; 
					
					//console.log("      Compare: " + delta, p, path);
					
					var startsWith = p.startsWith(path);
					//console.log("      Startswith: " + startsWith);
					if(delta == 1 && startsWith) {
						var step = pSteps[pSteps.length - 1];
						tmp.push(step);
					}
				}
			}
			
			var result = _.uniq(tmp, function(step) { return "" + step; });
			
			//console.log("Constraint result", constraints.length, result.length);
			
			return result;
		},
		
		getConstraints: function() {
		    return this.constraints;  
		},
		
		addConstraint: function(constraint) {
			this.constraints.push(constraint);
		},
		
		// Fcuking hack because of legacy code and the lack of a standard collection library...
		// TODO Make the constraints a hash set (or a list set)
		removeConstraint: function(constraint) {
		    var result = false;

		    var cs = this.constraints;
		    
		    var n = [];
		    for(var i = 0; i < cs.length; ++i) {
		        var c = cs[i];
		        
		        if(!c.equals(constraint)) {
		            n.push(c);
		        } else {
		            result = true;
		        }
		    }
		    
		    this.constraints = n;
		    return result;
		},

		toggleConstraint: function(constraint) {
		    var wasRemoved = this.removeConstraint(constraint);
		    if(!wasRemoved) {
		        this.addConstraint(constraint);
		    }
		},

		
//		createElement: function(facetNode, excludePath) {
//			console.log("Should not be invoked");
//			
//			var elements = this.createElements(facetNode, excludePath);
//			var result;
//			if(elements.length === 1) {
//				result = elements[0];
//			} else {
//				result = new sparql.ElementGroup(elements);
//			}
//			
//			return result;
//		},
		
		createElementsAndExprs: function(facetNode, excludePath) {
			//var triples = [];
			var elements = [];
			var resultExprs = [];
			
			
			var pathToExprs = {};
			
			var self = this;

			_(this.constraints).each(function(constraint) {
				var paths = constraint.getDeclaredPaths();
				
				var pathId = _(paths).reduce(
					function(memo, path) {
						return memo + ' ' + path;
					},
					''
				);

				// Check if any of the paths is excluded
				if(excludePath) {
					var skip = _(paths).some(function(path) {
						//console.log("Path.equals", excludePath, path);
						
						var tmp = excludePath.equals(path);
						return tmp;
					});

					if(skip) {
						return;
					}
				}
				
				
				_(paths).each(function(path) {
					
					//if(path.equals(excludePath)) {
						// TODO Exclude only works if there is only a single path
						// Or more generally, if all paths were excluded...
						// At least that somehow seems to make sense
					//}
					
					var fn = facetNode.forPath(path);
					
					//console.log("FNSTATE", fn);
					
					var tmpElements = fn.getElements();
					elements.push.apply(elements, tmpElements);
				});
				
				//var constraintName = constraint.getName();
//				var cef = self.cefRegistry.get(constraintName);
//				if(!cef) {
//					throw "No constraintElementFactory registered for " + constraintName;
//				}
				
				var ci = constraint.createElementsAndExprs(facetNode);
				
				//var ci = constraint.instanciate(facetNode);
				var ciElements = ci.getElements();
				var ciExprs = ci.getExprs();
				
				if(ciElements) {
					elements.push.apply(elements, ciElements);
				}				
				
				if(ciExprs && ciExprs.length > 0) {
				
					var exprs = pathToExprs[pathId];
					if(!exprs) {
						exprs = [];
						pathToExprs[pathId] = exprs;
					}
					
					var andExpr = sparql.andify(ciExprs);
					exprs.push(andExpr);
				}				
			});

			_(pathToExprs).each(function(exprs) {
				var orExpr = sparql.orify(exprs);
				resultExprs.push(orExpr);
			});
			
	        var result = new ns.ElementsAndExprs(elements, resultExprs);

	        return result;
		} 
	});

		/*
	    createElements: function() {
			
				var element = new sparql.ElementFilter(orExpr);

				//console.log("andExprs" +  element);

				elements.push(element);
			});

			//console.log("pathToExprs", pathToExprs);

			//console.log("[ConstraintManager::createElements]", elements);
			
			return elements;
		}
		
	});
	*/

})();


