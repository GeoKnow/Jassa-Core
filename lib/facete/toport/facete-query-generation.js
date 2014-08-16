(function() {

	var vocab = Jassa.vocab;
	var util = Jassa.util;
	var sparql = Jassa.sparql;
	var rdf = Jassa.rdf;
	
	var ns = Jassa.facete;

	
	
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
			var expr = new sparql.E_OneOf(new sparql.ExprVar(v), nodes);
			
			if(isNegated) {
				expr = new sparql.E_LogicalNot(expr);
			}

			result = new sparql.ElementFilter(expr);
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
		},
		
		setOffset: function(offset) {
		    this.offset = offset;
		},
		
		setLimit: function(limit) {
		    this.limit = limit;
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
		initialize: function(defaultLimit) {
		    this.defaultLimit = defaultLimit;
		    
			this.pathToState = new util.HashMap();
		},
		
		getMap: function() {
			return this.pathToState;
		},
		
		getFacetState: function(path) {
		    var result = this.pathToState.get(path);
		    
		    if(!result) {
		        result = new ns.FacetStateImpl(null, new ns.LimitAndOffset(this.defaultLimit, 0), null);
		        this.pathToState.put(path, result);
		    }
		    
			return result;
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
		}
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



