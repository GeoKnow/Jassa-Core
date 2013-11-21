(function() {
	
	var service = Jassa.service;
	var rdf = Jassa.rdf;
	
	
	var facete = Jassa.facete;
	
	var ns = Jassa.facete;

	

	/**
	 * Example / Test about the API is supposed to work
	 * 
	 */
	ns.test = function() {
		var qef = new service.QueryExecutionFactoryHttp("http://localhost/sparql", []);

		var constraintManager = new facete.ConstraintManager();
		
		


		
		var baseVar = rdf.NodeFactory.createVar("s");
		//alert("test" + baseVar);
		var baseConcept = facete.ConceptUtils.createSubjectConcept(baseVar);
		var rootFacetNode = facete.FacetNode.createRoot(baseVar);
		var facetStateProvider = new facete.FacetStateProviderImpl();		
		
		var facetConfigProvider = new facete.FacetGeneratorConfigProviderIndirect(
			new facete.ConceptFactoryConst(baseConcept),
			new facete.FacetNodeFactoryConst(rootFacetNode),
			constraintManager
		);
		
		var fcgf = new ns.FacetConceptGeneratorFactoryImpl(facetConfigProvider);
		var facetConceptGenerator = fcgf.createFacetConceptGenerator();
		
		var facetService = new facete.FacetServiceImpl(qef, facetConceptGenerator);
		

		
		constraintManager.addConstraint(new facete.ConstraintSpecPathValue(
			"equal",
			facete.Path.parse("http://www.w3.org/1999/02/22-rdf-syntax-ns#type"),
			sparql.NodeValue.makeNode(rdf.NodeFactory.createUri("http://www.w3.org/2002/07/owl#Class"))
		));

		
		
		facetService.fetchFacets(facete.Path.parse("")).done(function(list) {
			_(list).each(function(item) {
				console.log("Item: " + item);
			});
		});
		
		
		//var fqgf = facete.FacetQueryGeneratorFactoryImpl.createFromFacetConfigProvider(facetConfigProvider, facetStateProvider);

		
		//var queryGenerator = fqgf.createFacetQueryGenerator();
		
		//var facetConcept = queryGenerator.createFacetConcept(facete.Path.parse("http://foo"));
//		var facetConcept = queryGenerator.createQueryFacetList(facete.Path.parse(""));
//		
//		alert("" + facetConcept);
		
		
	};


	ns.testQueryApi = function() {
		var qef = new service.QueryExecutionFactoryHttp("http://localhost/sparql", []);
		var qe = qef.createQueryExecution("Select * { ?s ?p ?o } Limit 10");
		
		//qe.setTimeOut(3000);
		var s = rdf.NodeFactory.createVar("s");
		
		qe.execSelect().done(function(rs) {
			while(rs.hasNext()) {
				console.log("" + rs.nextBinding().get(s));
			}
		});
		
	};

	
})();
