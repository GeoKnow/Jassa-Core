(function() {
	
	var service = Jassa.service;
	var rdf = Jassa.rdf;
	
	
	var facete = Jassa.facete;
	
	var ns = Jassa.facete;

	/**
	 * 
	 * facetSpec: {
	 *   limit:
	 *   offset:
	 *   partitionLimit:
	 *   partitionOffset:
	 * }
	 *
	 * A note on keyword search:
	 * Keyword searches are usually performed on the whole tree up to a certain depth,
	 * so that even if a facet (at a certain path) does not match the search criteria,
	 * children of it might do so.
	 * 
	 * Design issue: Should the partition offset be part of the facet spec?
	 * Or rather is this something 
	 * 
	 */
	
	
	ns.FacetNodeService = Class.create({
		forPath: function(path) {
			
		},
		
		// getFacet(Facade)Node - return some underlying object
		
		fetchSubFacets: function() {

		},
		
		fetchSubFacetCount: function() {
			
		}
		
	});
	

	ns.FacetServiceSparql = Class.create({
		initialize: function(sparqlService, baseConcept, rootFacetNode, constraintManager) {
			this.sparqlService = sparqlService;
			
			
			
			
			this.baseConcept = baseConcept;
			this.rootFacetNode = rootFacetNode;
			this.contraintManager = constraintManager;
		},
		
		getRootNode: function() {
			
		}
	});


	ns.FacetServiceSparql.createFacetServiceDefault = function(sparqlService, baseConceptFactory) {
		if(baseConceptFactory == null) {
			var baseConcept = facets.ConceptUtils.createSubjectConcept();
			var baseConceptFactory = new facets.ConceptFactoryConst(baseConcept);
		}
		
//		var rootFacetNode = facets.FacetNode.createRoot(baseConcept.getVar());		 
//		var constraintManager = new facets.ConstraintManager();
//		var rootFacetFacadeNode = new facets.SimpleFacetFacade(constraintManager, rootFacetNode);
//
//		var result = new ns.FacteServiceSparql(sparqlService, baseConcept, )
	};

	
	
	/**
	 * Example / Test about the API is supposed to work
	 * 
	 */
	ns.test = function() {
		
		//alert("yay");

		//var sparqlService = new service.SparqlServiceHttp("http://dbpedia.org/sparql", ["http://dbpedia.org"]);
		var sparqlService = new service.SparqlServiceHttp("http://localhost/sparql", []);

		
//		qe = sparqlService.createQueryExecution("query");
//		qe.setTimeOut();
//		qe.execSelect();
		
		sparqlService.execSelect("Select * { ?s ?p ?o } Limit 10").done(function(rs) {
			while(rs.hasNext()) {
				console.log("" + rs.nextBinding().get(rdf.NodeFactory.createVar("s")));
				//console.log("" + rs.nextBinding().get("s"));
			}
		});
		
		
		var constraintManager = new facete.ConstraintManager();
		
//		var registry = constraintManager.getCefRegistry();
//		
//		registry.put("exist", new facete.ConstaintElementFactoryExist());
//		registry.put("equal", new facete.ConstaintElementFactoryEqual());
//		//registry.put("range", new facete.ConstaintElementFactoryRange());		
//		registry.put("bbox", new facete.ConstaintElementFactoryEqual());
		
		
		var path = facete.Path.fromString("http://foo");

		constraintManager.addConstraint(new facete.ConstraintSpecPathValue("equal", path, sparql.NodeValue.makeInteger(5)));
		
		
		
		//var facetService = 
		
		var v = rdf.NodeFactory.createVar("s");
		var baseConcept = facete.ConceptUtils.createSubjectConcept(v);

		
		
		//alert(JSON.stringify(baseConcept));
		
		//var facetFacadeNode = rootFacetFacadeNode.forPath(path);
		
		//constraintManager.addConstraint()
		//facetFacadeNode.addEqualsConstraint(NodeValue.makeUri("http://foo.bar"));

		//facetFacadeNode.addConstraint(facets.ConstraintUtils.create)
		
		//constraintManager.setAlwaysEmit(path, true);
		
		// Whether to emit corresponding triples even if no constraint is set
		//facetFacadeNode.setAlwaysEmit(true);
		
		
		
		
		// facetFacadeNode.addRangeConstraint(min, max)
		// E_InRange(exprTest, exprMin, exprMax)
		
		
//		var pathCollection = {};
//
//		
//		var facetService = new FacetServiceSparql({
//			sparqlService: sparqlService,
//			baseConceptProvider : function() { return baseConcept; },
//			rootFacetFacadeNode: rootFacetFacadeNode
//		});
//
//		
//		facetService.fetchSubFacetCount();
//		
//		facetService.fetchSubFacets(0, 100)
//		
		

		//
		
		//facetFacadeNode.addConstraint(ExprPathUtils.createEquals(, NodeValue.makeUri("http://foo.bar"));


//		canstraintManager.addConstraint(ExprPathUtils.createEquals());
		
//		new facets.PathExpr({
//			expr: new sparql.E_Equals(new ExprVar(v), NodeValue.makeUri("http://foo.bar"));
//			mapping: {v.getName()}
//		
		
	};
	
	
})();
