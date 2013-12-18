// Move some utility functions from Elements here
(function() {
	
    var rdf = Jassa.rdf;
	var util = Jassa.util;

	var ns = Jassa.sparql;
	

	ns.VarUtils = {
	    createVars: function(varNames) {
	        var result = varNames.map(function(varName) {
	            return rdf.NodeFactory.createVar(varName);
	        });

	        return result;
	    },
	    
	    getVarNames: function(vars) {
	        var result = vars.map(function(v) {
	            return v.getName();
	        });
	        
	        return result;
	    }
	};
	
	
	ns.Generator = Class.create({
		next: function() {
			throw "Override me";
		}
	});
	
	/**
	 * Another class that mimics Jena's behaviour.
	 * 
	 * @param prefix
	 * @param start
	 * @returns {ns.GenSym}
	 */
	ns.GenSym = Class.create(ns.Generator, {
		initialize: function(prefix, start) {
			this.prefix = prefix ? prefix : "v";
			this.nextValue = start ? start : 0;
		},
	
		next: function() {
			++this.nextValue;
			
			var result = this.prefix + "_" + this.nextValue;
			
			return result;
		}
	});

	ns.GenSym.create = function(prefix) {
		var result = new ns.GenSym(prefix, 0);
		return result;
	};

	/**
	 * 
	 * @param generator
	 * @param blacklist Array of strings
	 * @returns {ns.GeneratorBlacklist}
	 */
	ns.GeneratorBlacklist = Class.create(ns.Generator, {
		
		initialize: function(generator, blacklist) {
			this.generator = generator;
			this.blacklist = blacklist;
		},

		next: function() {
			var result;
			
			do {
				result = this.generator.next();
			} while(_.contains(this.blacklist, result));
				
			return result;
		}

	});



	ns.fnToString = function(x) {
		return x.toString();
	};

	ns.fnGetVarName = function(x) {
		return x.getName();
	};


	
	ns.PatternUtils = {
		getVarsMentioned: function(elements) {
			var result = [];
			_.each(elements, function(element) {
				_(result).union(element.getVarsMentioned());
			});
			
			return result;
		}
	};

	
	ns.ElementFactory = Class.create({
	    createElement: function() {
	        throw "Not overridden";
	    }
	});

	
	/**
	 * Element factory returning an initially provided object
	 */
	ns.ElementFactoryConst = Class.create(ns.ElementFactory, {
	    initialize: function(element) {
	        this.element = element;
	    },
	    
	    createElement: function() {
	        return this.element;
	    }
	});
	
	
	/**
	 * This factory creates an element Based on two elements (a, b) and corresponding join variables.
	 * 
	 * The variables in the first element are retained, whereas those of the
	 * second element are renamed as needed.
	 * 
	 * The purpose of this class is to support joining a concept created from faceted search
	 * with a sponate sparql element.
	 * 
	 * Example:
	 * {?x a Castle} join {?y rdfs:label} on (?x = ?y)
	 * after the join, the result will be
	 * {?y a Castle . ?y rdfs:label}
	 * 
	 * 
	 * 
	 * 
	 */
	ns.ElementFactoryJoin = Class.create(ns.ElementFactory, {
	    initialize: function(elementFactoryA, elementFactoryB, joinVarsA, joinVarsB, joinType) {
	        this.elementFactoryA = elementFactoryA;
	        this.elementFactoryB = elementFactoryB;
	        this.joinVarsA = joinVarsA;
	        this.joinVarsB = joinVarsB;
	        this.joinType = joinType ? ns.JoinType.INNER_JOIN : joinType;
	    },
	   
	    createElement: function() {
	        var elementA = this.elementFactoryA.createElement();
	        var elementB = this.elementFactoryB.createElement();
	       
	        var rootJoinNode = ns.JoinBuilderElement.create(elementB);
	        var joinNode = rootJoinNode.joinAny(this.joinType, this.joinVarsB, elementA, this.joinVarsA);

	        var joinBuilder = joinNode.getJoinBuilder();
	        var elements = joinBuilder.getElements();
	        var result = new sparql.ElementGroup(elements);
	        //var aliasToVarMap = joinBuilder.getAliasToVarMap();

	        return result;
	    }
	});
	
	
	ns.ElementFactoryJoinConcept = Class.create(ns.ElementFactory, {
        initialize: function(conceptFactoryA, conceptFactoryB, joinType) {
            this.conceptFactoryA = conceptFactoryA;
            this.conceptFactoryB = conceptFactoryB;
            this.joinType = joinType ? ns.JoinType.INNER_JOIN : joinType;
        },
	    
        createElement: function() {
            var conceptA = this.conceptFactoryA.createConcept();
            var conceptB = this.conceptFactoryB.createConcept();
            
            var elementA = conceptA.getElement();
            var elementB = conceptB.getElement();
            
            var joinVarsA = [conceptA.getVar()];
            var joinVarsB = [conceptB.getVar()];
            
            var rootJoinNode = ns.JoinBuilderElement.create(elementB);
            var joinNode = rootJoinNode.joinAny(this.joinType, joinVarsB, elementA, joinVarsA);

            var joinBuilder = joinNode.getJoinBuilder();
            var elements = joinBuilder.getElements();
            var result = new sparql.ElementGroup(elements);
            
            return result;
        }
	});
	
	
	ns.ElementUtils = {
		flatten: function(elements) {
			var result = _.map(elements, function(element) { return element.flatten(); });

			return result;
		},
		
		
		/**
		 * Bottom up
		 * - Merge ElementTripleBlocks
		 * - Merge ElementGroups
		 */
		flattenElements: function(elements) {
			var result = [];
			
			var triples = [];
			
			var tmps = [];
			_.each(elements, function(item) {
				if(item instanceof ns.ElementGroup) {
					tmps.push.apply(tmps, item.elements);
				} else {
					tmps.push(item);
				}
			});
			
			_.each(tmps, function(item) {
				if(item instanceof ns.ElementTriplesBlock) {
					triples.push.apply(triples, item.getTriples());
				} else {
					result.push(item);
				}
			});		

			if(triples.length > 0) {			
				var ts = ns.uniqTriples(triples);
				
				result.unshift(new ns.ElementTriplesBlock(ts));
			}
			
			//console.log("INPUT ", elements);
			//console.log("OUTPUT ", result);
			
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
			var result = new util.HashBidiMap(ns.fnNodeEquals);
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

    ns.ExprUtils = {
            
        copySubstitute: function(expr, binding) {
            var fn = (function(node) {
                
                var result = null;
                
                if(node.isVar()) {
                    //var varName = node.getName();
                    //var subst = binding.get(varName);
                    var subst = binding.get(node);
                    
                    if(subst != null) {
                        result = subst;
                    }
                }
                
                if(result == null) {
                    result = node;
                }
                
                return result;
            });
            

            var result = expr.copySubstitute(fn);
            return result;
        },
        
        /**
         * 
         * If varNames is omitted, all vars of the binding are used
         */
        bindingToExprs: function(binding, vars) {
            if(vars == null) {
                vars = binding.getVars();
            }

            var result = _(vars).each(function(v) {
                var exprVar = new sparql.ExprVar(v);
                var node = binding.get(v);
                
                // TODO What if node is NULL?
                
                var nodeValue = sparql.NodeValue.makeNode(node);
                
                var expr = new sparql.E_Equal(exprVar, nodeValue);
                
                return expr;
            });
            
            return result;
        }
        
    };
	
})();