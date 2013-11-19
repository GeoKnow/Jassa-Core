(function() {

	var util = Jassa.util;
	
	var ns = Jassa.facete;
	

	ns.LimitAndOffset = Class.create({
		getOffset: function() {
			
		},

		getLimit: function() {
			
		}		
	});
	
	ns.FacetState = Class.create({
		isOpen: function() {
			throw "Override me";
		},
		
		getResultSetRange: function() {
			throw "Override me"
		},
		
		getPartitionRange: function() {
			throw "Override me"			
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
	
	

	ns.FaceteQueryGenerator = Class.create({
		initialize: function(baseConceptFactory, rootFacetNodeFactory, constraintManager, facetStateProvider) {
			this.baseConceptFactory = baseConceptFactory;
			this.rootFacetNodeFactory = rootFacetNodeFactory;
			this.constraintManager = constraintManager;
			this.facetStateProvider = facetStateProvider;
		},
		
		
		/**
		 * Returns the p
		 */
//		createFacetConcept: function(path, isPathConstraintExcluded) {
//			var baseConcept = this.baseConceptFactory.createConcept();
//			
//			var constraintConcept = 
//		},
		
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
		createFacetConcept: function(path) {
			var rootFacetNode = this.rootFacetNodeFactory.createFacetNode(); 
			var baseConcept = this.baseConceptFactory.createConcept();
			var constraintManager = this.constraintManager;			
			var constraintElements = constraintManager.createElements(rootFacetNode);
			
			var baseElements = baseConcept.getElements();
			//baseElements.push.apply(baseElements, constraintElements);
			
			var facetConceptElements = baseElements.concat(constraintElements);
			
			var facetNode = rootFacetNode.forPath(path);
			var facetVar = facetNode.getVar();
			
			var result = new ns.Concept(facetConceptElements, facetVar);
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
		createFacetValueConcept: function(path, isInverse) {
			
		}
	});
	
	
	ns.FacetService = Class.create({
		initialize: function() {
		}
	});
	
})();
