(function() {

	var vocab = Jassa.vocab;
	var util = Jassa.util;
	var sparql = Jassa.sparql;
	
	var ns = Jassa.facete;

	
	/**
	 * A set (list) of nodes. Can be negated to mean everything except for this set. 
	 * Used as a base for the creation of filters and bindings for use with prepared queries.
	 * 
	 */
	ns.NodeSet = Class.create({
		initialize: function(nodes, isNegated) {
			this.nodes = nodes;
			this.isNegated = isNegated;
		},
		
		getNodes: function() {
			return this.nodes;
		},
		
		isNegated: function() {
			return this.isNegated;
		}
	});
	
	
//	ns.FacetConceptBound = Class.create({
//		initialize: function(facetConcept, nodeSet) {
//			//this.concept = concept;
//			//this.element = element;
//			//this.bindings = bindings;
//			
//		},
//		
//		getElement: function() {
//			return this.element;
//		},
//		
//		
//	});
	

	ns.FacetConceptItem = Class.create({
		initialize: function(step, concept) {
			this.step = step;
			this.concept = concept;
		},
		
		getStep: function() {
			return this.step;
		},
		
		getFacetConcept: function() {
			return this.concept;
		},
		
		toString: function() {
			return this.step + ": " + this.concept;
		}
	});
	
	
	/**
	 * Returns a single element or null
	 * 
	 * TODO A high level API based on binding objects may be better
	 */
	ns.createFilter = function(v, nodes, isNegated) {
		var uris = [];
		
//		var nodes = uriStrs.map(function(uriStr) {
//			return rdf.NodeFactory.createUri(uriStr);
//		});

		var result = null;
		if(nodes.length > 0) {
			var expr = new sparql.E_In(new sparql.ExprVar(v), nodes);
			
			if(isNegated) {
				expr = new sparql.E_LogicalNot(expr);
			}

			result = new sparql.ElementFilter([expr]);
		}
		
		return result;
	};
	
	// TODO Move to util package
	ns.itemToArray = function(item) {
		var result = [];
		if(item != null) {
			result.push(item);
		}

		return result;
	};


	/**
	 * 
	 * 
	 * Use null or leave undefined to indicate no constraint 
	 */
	ns.LimitAndOffset = Class.create({
		initialize: function(limit, offset) {
			this.limit = limit;
			this.offset = offset;
		},
		
		getOffset: function() {
			return this.offset;
		},

		getLimit: function() {
			return this.limit;
		}		
	});

	
	ns.FacetState = Class.create({
		isExpanded: function() {
			throw "Override me";
		},
		
		getResultRange: function() {
			throw "Override me";
		},
		
		getAggregationRange: function() {
			throw "Override me";
		}				
	});

	ns.FacetStateImpl = Class.create(ns.FacetState, {
		initialize: function(isExpanded, resultRange, aggregationRange) {
			this._isExpanded = isExpanded;
			this.resultRange = resultRange;
			this.aggregationRange = aggregationRange;
		},
		
		isExpanded: function() {
			return this._isExpanded;
		},
		
		getResultRange: function() {
			return this.resultRange; 
		},
		
		getAggregationRange: function() {
			return this.aggregationRange;			
		}		
	});
	

	ns.FacetStateProvider = Class.create({
		getFacetState: function(path) {
			throw "Override me";
		}
	});
	
	
	
	ns.FacetStateProviderImpl = Class.create({
		initialize: function() {
			this.pathToState = new util.HashMap();
		},
		
		getMap: function() {
			return this.pathToState;
		},
		
		getFacetState: function(path) {
			return this.pathToState.get(path);
		}
	});
	
	
	ns.FacetConceptGenerator = Class.create({
		createFacetConcept: function(path, isInverse) {
			throw "Override me";
		},

		createFacetValueConcept: function(path, isInverse) {
			throw "Override me";
		}

	});

	
	/**
	 * This is just a POJO
	 * 
	 */
	ns.FacetGeneratorConfig = Class.create({
		initialize: function(baseConcept, rootFacetNode, constraintManager) {
			this.baseConcept = baseConcept;
			this.rootFacetNode = rootFacetNode;
			this.constraintManager = constraintManager;
		},

		getBaseConcept: function() {
			return this.baseConcept;
		},
		
		getRootFacetNode: function() {
			return this.rootFacetNode;			
		},
		
		getConstraintManager: function() {
			return this.constraintManager;			
		}
	});


	// TODO Probably it is better to just make the "dataSource" an abstraction,
	// rather than the facet concept generator.
	ns.FacetGeneratorConfigProvider = Class.create({
		getConfig: function() {
			throw "Override me";			
		},
	});
	
	
	ns.FacetGeneratorConfigProviderConst = Class.create(ns.FacetGeneratorConfigProvider, {
		initialize: function(facetConfig) {
			this.facetConfig = facetConfig;
		},
		
		getConfig: function() {
			return this.facetConfig;
		}
	});
		
	ns.FacetGeneratorConfigProviderIndirect = Class.create(ns.FacetGeneratorConfigProvider, {
		initialize: function(baseConceptFactory, rootFacetNodeFactory, constraintManager) {
			this.baseConceptFactory = baseConceptFactory;
			this.rootFacetNodeFactory = rootFacetNodeFactory;
			this.constraintManager = constraintManager;
		},
		
		getConfig: function() {
			var baseConcept = this.baseConceptFactory.createConcept();
			var rootFacetNode = this.rootFacetNodeFactory.createFacetNode(); 
			var constraintManager = this.constraintManager;			
			//var constraintElements = constraintManager.createElements(rootFacetNode);
			
			var result = new ns.FacetGeneratorConfig(baseConcept, rootFacetNode, constraintManager);
			return result;
		}
	});

	
	ns.FacetConceptGeneratorFactory = Class.create({
		createFacetConceptGenerator: function() {
			throw "Implement me";
		}
	});
	
	
	/**
	 * Retrieves a facetConfig from a facetConfigProvider and uses it
	 * for the creation of a facetConceptGenerator.
	 * 
	 * These layers of indirection are there to allow creating a facetConceptFactory whose state
	 * can be made static* - so whose state is based on a snapshot of the states of 
	 * {baseConcept, rootFacetNode, constraintManager}.
	 * 
	 * *Currently the contract does not enforce this; the design is just aimed at enabling this.
	 * 
	 * Multiple calls to createFacetConfigGenerator may yield new objects with different configurations.
	 * 
	 */
	ns.FacetConceptGeneratorFactoryImpl = Class.create(ns.FacetConceptGeneratorFactory, {
		initialize: function(facetConfigProvider) {
			this.facetConfigProvider = facetConfigProvider;
		},
		
		createFacetConceptGenerator: function() {
			var facetConfig = this.facetConfigProvider.getConfig();
			
			var result = new ns.FacetConceptGeneratorImpl(facetConfig);
			return result;
		}
	});

	ns.FacetConceptGeneratorImpl = Class.create(ns.FacetConceptGenerator, {
		initialize: function(facetConfig) {
			this.facetConfig = facetConfig;
		},
		
		
		/**
		 * Create a concept for the set of resources at a given path
		 * 
		 * 
		 */
		createConceptResources: function(path, excludeSelfConstraints) {
			var facetConfig = this.facetConfig;
			
			var baseConcept = facetConfig.getBaseConcept();
			var rootFacetNode = facetConfig.getRootFacetNode(); 
			var constraintManager = facetConfig.getConstraintManager();

			
			var excludePath = excludeSelfConstraints ? path : null;			
			var constraintElements = constraintManager.createElements(rootFacetNode, excludePath);

			var facetNode = rootFacetNode.forPath(path);
			var facetVar = facetNode.getVar();

			
			var baseElements = baseConcept.getElements();

			var facetElements; 
			if(baseConcept.isSubjectConcept()) {
				facetElements = constraintElements.length > 0 ? constraintElements : baseConcept.getElements(); 
			} else {
				facetElements = baseElements.concat(constraintElements); 
			}
			
			var pathElements = facetNode.getElements();
			facetElements.push.apply(facetElements, pathElements);

			// TODO Fix the API - it should only need one call
			var finalElements = sparql.ElementUtils.flatten(facetElements);
			finalElements = sparql.ElementUtils.flattenElements(finalElements);
			
			//var result = new ns.Concept(finalElements, propertyVar);
			var result = new ns.Concept(finalElements, facetVar);
			return result;
		},
		
		/**
		 * Creates a concept for the facets at a given path
		 * 
		 * This method signature is not final yet.
		 *
		 * 
		 */
		createConceptFacetsCore: function(path, isInverse, enableOptimization, singleProperty) { //excludeSelfConstraints) {

			
			var facetConfig = this.facetConfig;
			
			var baseConcept = facetConfig.getBaseConcept();
			var rootFacetNode = facetConfig.getRootFacetNode(); 
			var constraintManager = facetConfig.getConstraintManager();

			
			//var excludePath = excludeSelfConstraints ? path : null;			
			var singleStep = null;
			if(singleProperty) {
				singleStep = new ns.Step(singleProperty.getUri(), isInverse);
			}

			
			var excludePath = null;
			if(singleStep) {
				excludePath = path.copyAppendStep(singleStep);
			}
			
			var constraintElements = constraintManager.createElements(rootFacetNode, excludePath);

			var facetNode = rootFacetNode.forPath(path);
			var facetVar = facetNode.getVar();

			
			var baseElements = baseConcept.getElements();
			//baseElements.push.apply(baseElements, constraintElements);
			
			var facetElements; 
			if(baseConcept.isSubjectConcept()) {
				facetElements = constraintElements;
			} else {
				facetElements = baseElements.concat(constraintElements); 
			}
			
			var varsMentioned = sparql.PatternUtils.getVarsMentioned(facetElements); //.getVarsMentioned();
			var varNames = varsMentioned.map(function(v) { return v.getName(); });
			
			var genProperty = new sparql.GeneratorBlacklist(sparql.GenSym.create("p"), varNames);
			var genObject = new sparql.GeneratorBlacklist(sparql.GenSym.create("o"), varNames);
			
			var propertyVar = rdf.NodeFactory.createVar(genProperty.next());
			var objectVar = rdf.NodeFactory.createVar(genObject.next());
			
			// If there are no constraints, and the path points to root (i.e. is empty),
			// we can use the optimization of using the query ?s a rdf:Property
			// This makes several assumptions, TODO point to a discussion 

			// but on large datasets it may work much better than having to scan everything for the properties.
			
			var hasConstraints = facetElements.length !== 0;

			var triple; 
			
			if(enableOptimization && !hasConstraints && path.isEmpty()) {
				triple = new rdf.Triple(propertyVar, vocab.rdf.type, vocab.rdf.Property);
			} else {
				if(!isInverse) {
					triple = new rdf.Triple(facetVar, propertyVar, objectVar);
				} else {
					triple = new rdf.Triple(objectVar, propertyVar, facetVar);
				}
			}
			
			facetElements.push(new sparql.ElementTriplesBlock([triple]));
			
			
			if(singleStep) {
				var exprVar = new sparql.ExprVar(propertyVar);
				var expr = new sparql.E_Equals(exprVar, sparql.NodeValue.makeNode(singleProperty));
				facetElements.push(new sparql.ElementFilter([expr]));
			}
			
			
			var pathElements = facetNode.getElements();
			facetElements.push.apply(facetElements, pathElements);

			// TODO Fix the API - it should only need one call
			var finalElements = sparql.ElementUtils.flatten(facetElements);
			finalElements = sparql.ElementUtils.flattenElements(finalElements);
			
			//var result = new ns.Concept(finalElements, propertyVar);
			var result = new ns.FacetConcept(finalElements, propertyVar, objectVar);
			return result;
		},
		
		/**
		 * Creates a concept that fetches all facets at a given path
		 *
		 * Note that the returned concept does not necessarily
		 * offer access to the facet's values.
		 * 
		 * Examples:
		 * - ({?s a rdf:Property}, ?s)
		 * - ({?s a ex:Foo . ?s ?p ?o }, ?p)
		 * 
		 */
		createConceptFacets: function(path, isInverse) {
			var facetConcept = this.createConceptFacetsCore(path, isInverse, true);
			
			var result = new ns.Concept.createFromElements(facetConcept.getElements(), facetConcept.getFacetVar());
			return result;
		},

		
		/**
		 * TODO The name is a bit confusing...
		 * 
		 * The returned concept (of type FacetConcept) holds a reference
		 * to the facet and facet value variables.
		 * 
		 * Intended use is to first obtain the set of properties, then use this
		 * method, and constraint the concept based on the obtained properties.
		 * 
		 * Examples:
		 * - ({?p a rdf:Propery . ?s ?p ?o }, ?p, ?o })
		 * - ({?s a ex:Foo . ?o ?p ?s }, ?p, ?o)
		 * 
		 * @return  
		 */
		createConceptFacetValues: function(path, isInverse, properties, isNegated) { //(model, facetFacadeNode) {

			isInverse = isInverse == null ? false : isInverse;
			
			var result;
			
			var propertyNames = properties.map(function(property) {
				return property.getUri();
			});
			
			
			var facetConfig = this.facetConfig;
			
			var baseConcept = facetConfig.getBaseConcept();
			var rootFacetNode = facetConfig.getRootFacetNode(); 
			var constraintManager = facetConfig.getConstraintManager();


			var facetNode = rootFacetNode.forPath(path);
			

			// Set up the concept for fetching facets on constrained paths
			// However make sure to filter them by the user supplied array of properties
			var tmpConstrainedSteps = constraintManager.getConstrainedSteps(path);
			
			//console.log("ConstrainedSteps: ", tmpConstrainedSteps);
			
			var constrainedSteps = _(tmpConstrainedSteps).filter(function(step) {
				var isSameDirection = step.isInverse() === isInverse;
				if(!isSameDirection) {
					return false;
				}
				
				var isContained = _(propertyNames).contains(step.getPropertyName());
								
				var result = isNegated ? !isContained : isContained;
				return result;
			});
			
			var excludePropertyNames = constrainedSteps.map(function(step) {
				return step.getPropertyName();
			});

			var includeProperties = [];
			var excludeProperties = [];
			
			_(properties).each(function(property) {
				if(_(excludePropertyNames).contains(property.getUri())) {
					excludeProperties.push(property);
				}
				else {
					includeProperties.push(property);
				}
			});
			
			console.log("excludePropertyNames: ", excludePropertyNames);
			
			// The first part of the result is formed by conceptItems for the constrained steps
			var result = this.createConceptItems(facetNode, constrainedSteps);
			
			
			// Set up the concept for fetching facets of all concepts that were NOT constrained
			//var genericConcept = facetFacadeNode.createConcept(true);
			var genericFacetConcept = this.createConceptFacetsCore(path, isInverse, false);
			var genericElements = genericFacetConcept.getElements();
			
			//var genericConcept = genericFacetConcept.getConcept();
			
			//var genericElement = ns.createConceptItemForPath(baseConcept, facetNode, constraintManager, path, false);
			
			// Combine this with the user specified array of properties
			var filterElement = ns.createFilter(genericFacetConcept.getFacetVar(), includeProperties, false);
			if(filterElement != null) {
				genericElements.push(filterElement);
			}
			
			var genericConceptItem = new ns.FacetConceptItem(null, genericFacetConcept);
			
			result.push(genericConceptItem);
			
			return result;
		},
		
		createConceptItems: function(facetNode, constrainedSteps) {
			var self = this;
			
			var result = _(constrainedSteps).map(function(step) {
				var tmp = self.createConceptItem(facetNode, step);
				return tmp;
			});
			
			return result;
		},
	
		createConceptItem: function(facetNode, step) {
			var propertyName = step.getPropertyName();
	
			var property = rdf.NodeFactory.createUri(propertyName);
			
			//var targetNode = facetNode.forStep(step);
			//var path = targetNode.getPath();
			
			var path = facetNode.getPath();
			var targetConcept = this.createConceptFacetsCore(path, step.isInverse(), false, property);
			//var targetConcept = ns.createConceptForPath(rootFacetNode, constraintManager, path, true);
			//var subNode = facetFacadeNode.forProperty(stepfacetUri.value, step.isInverse);
				
			var result = new ns.FacetConceptItem(step, targetConcept);
			return result;
		}
		
//		
//		createConceptsFacetValues: function(path, isInverse, properties, isNegated) {
//			
//			var self = this;
//	
//			var sampleSize = null; // 50000;
//			//var facetVar = sparql.Node.v("__p");
//			//var countVar = sparql.Node.v("__c");
//			
//			var query = queryUtils.createQueryFacetCount(concept, facetVar,
//					countVar, this.isInverse, sampleSize);
//	
//			//console.log("[DEBUG] Fetching facets with query: " + query);
//			
//			var uris = [];
//			if(steps && steps.length > 0) {
//				
//				// Create the URIs from the steps
//				for(var i = 0; i < steps.length; ++i) {
//					var step = steps[i];
//					
//					if(step.isInverse() === this.isInverse) {
//						var propertyUri = sparql.Node.uri(step.propertyName);
//	
//						uris.push(propertyUri);
//					}
//				}
//				
//				// Skip fetching if we have inclusion mode with no uris
//				if(mode === true) {
//					if(uris.length === 0) {
//						return null;
//					}
//				}	
//	
//				
//				if(uris.length !== 0) {
//					var expr = new sparql.E_In(new sparql.ExprVar(facetVar), uris);
//					
//					if(!mode) {
//						expr = new sparql.E_LogicalNot(expr);
//					}
//	
//					var filter = new sparql.ElementFilter([expr]);
//	
//					//console.log("Filter: ", filter);
//					query.elements.push(filter);
//				}
//			}
//			
//			return query;
//	
//		}

//		createConceptFacetValues: function(path, isInverse) {
//			var result = this.createConceptFacetsCore(path, isInverse, false);
//			
//			return result;
//		}
		
		
	});
	


//	ns.createConceptForPath = function(rootFacetNode, constraintManager, path, includeSelfConstraints) {
//
//		var facetNode = rootFacetNode.forPath(path); 
//		var excludePath = includeSelfConstraints ? null : facetNode.getPath();
//		
//		// Create the constraint elements
//		var elements = constraintManager.createElements(rootNode, excludePath);
//		//console.log("___Constraint Elements:", elements);
//		
//		// Create the element for this path (if not exists)
//		var pathElements = facetNode.getElements();
//		//console.log("___Path Elements:", elements);
//		
//		elements.push.apply(elements, pathElements);
//		
//		var result = sparql.ElementUtils.flatten(elements);
//		
//		
//		
//		//console.log("Flattened: ", result);
//		
//		// Remove duplicates
//		
//		return result;
//	};
	

	
// The FacetQueryGenerator related classes did not turn out to be useful, as the query generation
// in general is determined by the data fetching strategy.
	
//	ns.FacetQueryGeneratorFactory = Class.create({
//		createFacetQueryGenerator: function() {
//			throw "Override me";
//		}
//	});
//	
	
//	ns.FacetQueryGeneratorFactoryImpl = Class.create(ns.FacetQueryGeneratorFactory, {
//		initialize: function(facetConceptGeneratorFactory, facetStateProvider) {
//			this.facetConceptGeneratorFactory = facetConceptGeneratorFactory;
//			this.facetStateProvider = facetStateProvider;
//		},
//		
//		createFacetQueryGenerator: function() {
//			var facetConceptGenerator = this.facetConceptGeneratorFactory.createFacetConceptGenerator(); 
//
//			var result = new ns.FacetQueryGeneratorImpl(facetConceptGenerator, this.facetStateProvider);
//			return result;
//		}
//	});
//
//	ns.FacetQueryGeneratorFactoryImpl.createFromFacetConfigProvider = function(facetConfigProvider, facetStateProvider) {
//		var fcgf = new ns.FacetConceptGeneratorFactoryImpl(facetConfigProvider);
//		
//		var result = new ns.FacetQueryGeneratorFactoryImpl(fcgf, facetStateProvider);
//		return result;
//	};
	
	
//	
//	/**
//	 * Combines the FacetConceptGenerator with a facetStateProvider
//	 * in order to craft query objects.
//	 * 
//	 */
//	ns.FacetQueryGeneratorImpl = Class.create({
//		initialize: function(facetConceptFactory, facetStateProvider) {
//			this.facetConceptFactory = facetConceptFactory;
//			this.facetStateProvider = facetStateProvider;
//		},
//		
//		/**
//		 * Creates a query for retrieving the properties at a given path.
//		 * 
//		 * Applies limit and offset both for aggregation and retrieval according
//		 * to the facetState for that path.
//		 * 
//		 * 
//		 * The intended use of the querie's result set is to retrieve the facet count for each of the properties 
//		 * 
//		 * TODO: Which component should be responsible for retrieving all facets that match a certain keyword?
//		 * 
//		 * 
//		 * 
//		 */
//		createQueryFacetList: function(path, isInverse) {
//			var concept = this.facetConceptFactory.createFacetConcept(path, isInverse);
//			
//			var facetState = this.facetStateProvider.getFacetState(path, isInverse);
//			
//			return concept;
//		},
//		
//		createQueryFacetCount: function() {
//			
//		},
//		
//		
//		/**
//		 * Create a set of queries that yield the facet value counts
//		 * for a given set of properties facing at a direction at a given path
//		 * 
//		 * The result looks something like this:
//		 * TODO Finalize this, and create a class for it.
//		 * 
//		 * {
//		 *    constrained: {propertyName: concept}
//		 *    unconstrained: concept
//		 * }
//		 * 
//		 * 
//		 */
//		createFacetValueCountQueries: function(path, isInverse, properties, isNegated) {
//			
//			var self = this;
//
//			var sampleSize = null; // 50000;
//			//var facetVar = sparql.Node.v("__p");
//			//var countVar = sparql.Node.v("__c");
//			
//			var query = queryUtils.createQueryFacetCount(concept, facetVar,
//					countVar, this.isInverse, sampleSize);
//
//			//console.log("[DEBUG] Fetching facets with query: " + query);
//			
//			var uris = [];
//			if(steps && steps.length > 0) {
//				
//				// Create the URIs from the steps
//				for(var i = 0; i < steps.length; ++i) {
//					var step = steps[i];
//					
//					if(step.isInverse() === this.isInverse) {
//						var propertyUri = sparql.Node.uri(step.propertyName);
//
//						uris.push(propertyUri);
//					}
//				}
//				
//				// Skip fetching if we have inclusion mode with no uris
//				if(mode === true) {
//					if(uris.length === 0) {
//						return null;
//					}
//				}	
//
//				
//				if(uris.length !== 0) {
//					var expr = new sparql.E_In(new sparql.ExprVar(facetVar), uris);
//					
//					if(!mode) {
//						expr = new sparql.E_LogicalNot(expr);
//					}
//
//					var filter = new sparql.ElementFilter([expr]);
//
//					//console.log("Filter: ", filter);
//					query.elements.push(filter);
//				}
//			}
//			
//			return query;
//			
//			
//		},
//		
//		
//		/**
//		 * Some Notes on partitioning:
//		 * - TODO Somehow cache the relation between filter configuration and fetch strategy
//		 * Figure out which facet steps have constraints:
//		 * For each of them we have to fetch the counts individually by excluding
//		 * constraints on that path			
//		 * On the other hand, we can do a single query to capture all non-constrained paths
//		 */
//		createFacetValueCountQueries: function(path, isInverse, propertyNames, isNegated) { //(model, facetFacadeNode) {
//
//			// TODO get access to rootFacetNode
//			var facetNode = this.rootFacetNode.forPath(path);
//			
//
//			// Set up the concept for fetching facets on constrained paths
//			// However make sure to filter them by the user supplied array of properties
//			var tmpConstrainedSteps = this.constraintManager.getConstrainedSteps(path);
//			
//			var constrainedSteps = _(tmpConstrainedSteps).filter(function(step) {
//				var isSameDirection = step.isInverse() === isInverse;
//				if(!isSameDirection) {
//					return false;
//				}
//				
//				var isContained = _(propertyNames).contains(step.getPropertyName());
//								
//				var result = isNegated ? !isContained : isContained;
//				return result;
//			});
//			
//			var excludePropertyNames = constrainedSteps.map(function(step) {
//				return step.getPropertyName();
//			});
//			
//			var constrainedConceptItems = this.createConceptItems(facetNode, constrainedSteps);
//
//			// Set up the concept for fetching facets of all concepts that were NOT constrained
//			var genericConcept = facetFacadeNode.createConcept(true);
//			
//			
//			// Combine this with the user specified array of properties 
//			var filterElement = ns.createFilter(genericConcept.getVar(), excludePropertyNames, isNegated);
//			if(filterElement != null) {
//				genericConcept.getElements().push(filterElement);
//			}
//			
//				
//			
//		},
//
//
//		/**
//		 * This function loads the facets of a specific concept.
//		 */
//		fnFetchSubFacets: function(sparqlService, conceptItem) {
//	
//			var facetUri = conceptItem.property;
//			var concept = conceptItem.concept;
//			
//			var element = concept.getElement();
//			var variable = concept.getVariable();
//			
//			var outputVar = sparql.Node.v("__c");
//			var limit = null;
//	
//			var query = queryUtils.createQueryCount(element, null, variable, outputVar, null, true, null);
//			//console.log("Fetching facets with ", query);
//			var queryExecution = queryUtils.fetchInt(sparqlService, query, outputVar);
//	
//			
//			var promise = queryExecution.pipe(function(facetCount) {
//				conceptItem.facetCount = facetCount;
//				//item.facetFacadeNode = subNode;
//				//item.step = step;
//	
//				//console.log("ConceptItem: ", conceptItem);
//				
//				// We need to return arrays for result 
//				var result = [conceptItem];
//				return result;
//			});
//	
//			return promise;
//		},
//
//	
//		/**
//		 * Create the list of all facets that carry constraints and
//		 * for which we have to fetch their facets.
//		 */
//		createConceptItems: function(facetNode, constrainedSteps) {
//			var self = this;
//			
//			var result = _(constrainedSteps).map(function(step) {
//				var tmp = self.createConceptItem(facetNode, step);
//				return tmp;
//			});
//			
//			return result;
//		},
//		
//		createConceptItem: function(facetNode, step) {
//			var propertyName = step.getPropertyName();
//
//			var targetNode = facetNode.forStep(step);
//			var targetConcept = targetNode.createConcept();
//			//var subNode = facetFacadeNode.forProperty(stepfacetUri.value, step.isInverse);
//
//			var result = new ns.StepAndConcept(step, targetConcept);
//
////			var prefix = self.isInverse ? "<" : "";
////
////			var result = {
////				id: "simple_" + prefix + propertyName,
////				type: 'property',
////				property: propertyName,
////				isInverse: step.isInverse,
////				concept: targetConcept,
////				step: step,
////				facetFacadeNode: targetNode
////			};		
////			
//			return result;
//		}
//	});
//	

})();





//ns.FacetConceptGeneratorDelegate = Class.create(ns.FacetConceptGenerator, {
//getDelegate: function() {
//	throw "Override me";
//},
//
//createFacetConcept: function(path, isInverse) {
//	var delegate = this.getDelegate();
//	var result = delegate.createFacetConcept(path, isInverse);
//	return result;
//},
//
//createFacetValueConcept: function(path, isInverse) {
//	var delegate = this.getDelegate();
//	var result = delegate.createFacetValueConcept(path, isInverse);
//	return result;
//}
//});


//ns.FacetConceptGeneratorIndirect = Class.create(ns.FacetConceptGeneratorDelegate, {
//initialize: function(baseConceptFactory, rootFacetNodeFactory, constraintManager, facetStateProvider) {
//	this.baseConceptFactory = baseConceptFactory;
//	this.rootFacetNodeFactory = rootFacetNodeFactory;
//	this.constraintManager = constraintManager;
//	this.facetStateProvider = facetStateProvider;
//},
//
//getDelegate: function() {
//	var rootFacetNode = this.rootFacetNodeFactory.createFacetNode(); 
//	var baseConcept = this.baseConceptFactory.createConcept();
//	var constraintManager = this.constraintManager;			
//	var constraintElements = constraintManager.createElements(rootFacetNode);
//
//	var result = new ns.FacetConceptGenerator(baseConcept, rootFacetNode, constraintManager);
//	
//	return result;
//}
//});

