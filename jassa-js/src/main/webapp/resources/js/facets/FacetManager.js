(function() {
	
	var ns = Namespace("org.aksw.ssb.facets");

	

	ns.QueryFactoryFacets = function(subQueryFactory, rootFacetNode, constraintManager) {
		this.subQueryFactory = subQueryFactory;
		this.rootFacetNode = rootFacetNode;
		this.constraintManager = constraintManager ? constraintManager : new ns.ConstraintManager();
	};
	
	ns.QueryFactoryFacets.create = function(subQueryFactory, rootVarName, generator) {
		generator = generator ? generator : new facets.GenSym("fv");
		var rootFacetNode = facets.FacetNode.createRoot(rootVarName, generator);
		
		var result = new ns.QueryFactoryFacets(subQueryFactory, rootFacetNode);

		return result;
	};

	ns.QueryFactoryFacets.prototype = {
		getRootFacetNode: function() {
			return this.rootFacetNode;
		},
			
		getConstraintManager: function() {
			return this.constraintManager;
		},
			
		createQuery: function() {
			var query = this.subQueryFactory.createQuery();

			//var varsMentioned = query.getVarsMentioned();
			var varsMentioned = query.getProjectVars().getVarList();
			

			var varNames = _.map(varsMentioned, function(v) {
				return v.value;
			});
			
			
			var elements = this.constraintManager.createElements(this.rootFacetNode);
			query.elements.push.apply(query.elements, elements);
			
			return query;
		}	
	};
	
	
	ns.ArrayAdapterArray = {
		
	};
	
	
	/*
	ns.Breadcrumb = function(facetManager, path) {
		this.facetManager = facetManager;
		this.path = path;
	}
	*/
	
	ns.ConstraintNode = function(facetNode, parent) {
		this.facetNode = facetNode;
		this.parent = parent;
		
		this.idToConstraint = {};
	};

	

	
	
	ns.SparqlDataflow = function(query, fnPostProcessor) {
		this.query = query;
		this.fnPostProcessor = fnPostProcessor;
	};
	
	ns.SparqlDataflow.prototype = {
		createDataProvider: function(sparqlServer) {

			var executor = new facets.ExecutorQuery(sparqlService, query);
			var result = new DataProvider(executor);
			
			// TODO Attach the postProcessing workflow
			
			return result;
		}
	};	
	
	ns.ElementDesc = function(element, focusVar, facetVar) {
		this.element = element;
		this.focusVar = focusVar;
		this.facetVar = facetVar;
	};
	

	ns.ElementDesc.prototype = {
			createConcept: function() {
				var result = new facets.ConceptInt(this.element, this.facetVar);
				return result;
			},
			
			createQueryFacetValueCounts: function() {
				var element = this.element;
				
				var focusVar = this.focusVar;
				var facetVar = this.facetVar;

				var sampleLimit = null;
								
				countVar = countVar ? countVar : sparql.Node.v("__c");
				var result = queryUtils.createQueryCount(element, sampleLimit, focusVar, countVar, [facetVar], options);
				
				return result;
			},
			
			createQueryFacetValues: function() {
				var element = this.element;
								
				var focusVar = this.focusVar;
				var facetVar = this.facetVar;

				var sampleLimit = null;
				
				countVar = countVar ? countVar : sparql.Node.v("__c");
				var result = queryUtils.createQueryCountDistinct(element, sampleLimit, focusVar, countVar, [facetVar], options);

				return result;
			}
	};
	
	
	/**
	 * Utility functions for creating constraints on paths.
	 * 
	 * TODO: What about an E_Range(givenExpr, minExpr, maxExpr)?
	 * This one does not exist in the SPARQL standard,
	 * but the effective expression would be
	 * givenExpr > minExpr && givenEXpr < maxExpr
	 * 
	 * So it would be a useful abstraction.
	 * The fundamental question is, whether this abstraction
	 * should be done with the SPARQL classes in the first place.
	 * 
	 */
	ns.ConstraintUtils = {
		createEquals: function(path, expr) {
			var v = sparql.Node.v("e");
			var ev = new sparql.ExprVar(v);
			
			var ex = new sparql.E_Equals(ev, expr);			
			var varToPath = {e: path};
			
			var result = new ns.ConstraintExpr(ex, varToPath);
			return result;
		}
	};
	
	
	
	/**
	 * An expressions whose variables are expressed in terms
	 * of paths.
	 * 
	 * TODO What if we constrained a geo resource to a bounding box?
	 * If the instance function accepted a facet node,
	 * then a constraint could use it to create new triples (e.g. geoResource lat/long ?var)
	 * 
	 * On the other hand, as this essentially places constraints at
	 * different paths (i.e. range constraints on lat/long paths),
	 * so actually, we could expand this constraints to sub-constraints,
	 * resulting in a hierarchy of constraints, and also resulting
	 * in another layer of complexity...
	 * 
	 * 
	 * 
	 * 
	 * Constraint.intstanciate(facetNode
	 * 
	 * 
	 * @param expr
	 * @param varToPath
	 * @returns {ns.Constraint}
	 */
	ns.ConstraintExpr = function(expr, varToPath)  {
		this.expr = expr;
		this.varToPath = varToPath;
	},
	
	ns.ConstraintExpr.prototype = {
		/*
		 * Get the paths used by this expression
		 */
		getPaths: function() {
			var result = _.values(this.varToPath);
			return result;
		},
			
		getId: function() {
			
		},
		
		toString: function() {
			return this.getId();
		},
		
		/**
		 * Returns an array of elements.
		 * 
		 * Change: It now returns an element and a set of expressions.
		 * The expressions get ORed when on the same path
		 * 
		 * Replaces the variables in the expressions
		 * with those for the paths.
		 * 
		 * 
		 * Usually the facetNode should be the root node.
		 * 
		 * @param varNode
		 */
		instanciate: function(facetNode) {
			var varMap = {};
			
			_.each(this.varToPath, function(path, varName) {
				var targetFacetNode = facetNode.forPath(path);
				var v = targetFacetNode.getVariable();
				varMap[varName] = v;
			});
			
			var fnSubstitute = function(node) {
				//console.log("Node is", node);
				if(node.isVar()) {
					var varName = node.getValue();
					var v = varMap[varName];
					if(v) {
						return v;
					}
				}
				return node;
			};
			
			//console.log("Substituting in ", this.expr);
			var tmpExpr = this.expr.copySubstitute(fnSubstitute);
			
			var result = {
					elements: [], //element],
					exprs: [tmpExpr]
			};
			
			/*
			var result = [element];
			*/
			
			return result;
			//substitute
		}
	};

	
	/**
	 * Are constraints connected to paths?
	 * Actually we could do this:
	 * E_GreaterThan(?a, 1000)
	 * 
	 * ?a = new Path(new Step("http://.../amount"));
	 * 
	 * This way we could reuse all expr classes, and just replace
	 * the variables. 
	 * 
	 * @returns {ns.ConstraintManager}
	 */
	ns.ConstraintManager = function() {
		this.constraints = [];
		
		//var pathIdToConstraints = {};
	};
	
	ns.ConstraintManager.prototype = {
		
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
				
				var paths = constraint.getPaths();
				
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
			checkNotNull(path);
			
			var tmp = [];
			
			var steps = path.getSteps();
			var constraints = this.constraints;
			
			for(var i = 0; i < constraints.length; ++i) {
				var constraint = constraints[i];
				//console.log("  Constraint: " + constraint);

				var paths = constraint.getPaths();
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
			
		addConstraint: function(constraint) {
			this.constraints.push(constraint);
		},
		
		removeConstraint: function() {
			// TODO implement
		},
		
		createElement: function(facetNode, excludePath) {
			console.log("Should not be invoked");
			
			var elements = this.createElements(facetNode, excludePath);
			var result;
			if(elements.length === 1) {
				result = elements[0];
			} else {
				result = new sparql.ElementGroup(elements);
			}
			
			return result;
		},
		
		createElements: function(facetNode, excludePath) {
			//var triples = [];
			var elements = [];
			
			
			var pathToExprs = {};
			
			_.each(this.constraints, function(constraint) {
				var paths = constraint.getPaths();
				
				var pathId = _.reduce(
						paths,
						function(memo, path) {
							return memo + " " + path;
						},
						""
				);

				// Check if any of the paths is excluded
				if(excludePath) {
					var skip = _.some(paths, function(path) {
						//console.log("Path.equals", excludePath, path);
						
						var tmp = excludePath.equals(path);
						return tmp;
					});

					if(skip) {
						return;
					}
				}
				
				
				_.each(paths, function(path) {
					
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
				
				var ci = constraint.instanciate(facetNode);
				var ciElements = ci.elements;
				var ciExprs = ci.exprs;
				
				if(ciElements)
				{
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

			_.each(pathToExprs, function(exprs) {
				var orExpr = sparql.orify(exprs);
				var element = new sparql.ElementFilter([orExpr]);

				//console.log("andExprs" +  element);

				elements.push(element);
			});

			//console.log("pathToExprs", pathToExprs);

			//console.log("[ConstraintManager::createElements]", elements);
			
			return elements;
		}
		
	};
	

	

	
	
	
	
})();
