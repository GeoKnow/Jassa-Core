(function() {

	var util = Jassa.util;
	var sparql = Jassa.sparql;
	
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
		createFacetConcept: function(path, isInverse) {
			var rootFacetNode = this.rootFacetNodeFactory.createFacetNode(); 
			var baseConcept = this.baseConceptFactory.createConcept();
			var constraintManager = this.constraintManager;			
			var constraintElements = constraintManager.createElements(rootFacetNode);

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
			
			var hasConstraints = facetElements.length == 0;

			var triple; 
			
			if(!hasConstraints && path.length === 0) {
				triple = new rdf.Triple(propertyVar, vocab.rdf.type, vocab.rdf.Property);
			} else {
				if(!isInverse) {
					triple = new rdf.Triple(facetVar, propertyVar, objectVar);
				} else {
					triple = new rdf.Triple(objectVar, propertyVar, facetVar);
				}
			}
			
			facetElements.push(new sparql.ElementTriplesBlock([triple]));
			
			var result = new ns.Concept(facetElements, facetVar);
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
