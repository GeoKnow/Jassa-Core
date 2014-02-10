(function() {

    var ns = Jassa.facete;
    
    // TODO This class is NOT used yet - its purpose is to make the FacetValueListCtrl simpler 
    ns.FacetValueService = Class.create({
        initialize: function(facetService, facetConceptGenerator, constraintTaggerFactory) {
            this.sparqlService = sparqlService;
            this.facetService = facetService;
            this.constraintTaggerFactory = constraintTaggerFactory;
        },
       
        fetchFacetValues: function(path, excludeSelfConstraints) {
            var facetService = this.facetService;
            var constraintTaggerFactory = this.constraintTaggerFactory;


            var concept = facetConceptGenerator.createConceptResources(path, excludeSelfConstraints);

            var concept = facetService.createConceptFacetValues(path, true);
            var countVar = rdf.NodeFactory.createVar("_c_");
            var queryCount = facete.ConceptUtils.createQueryCount(concept, countVar);
            var qeCount = qef.createQueryExecution(queryCount);
            var countPromise = service.ServiceUtils.fetchInt(qeCount, countVar);
            
            var query = facete.ConceptUtils.createQueryList(concept);           
            
            

            
            var pageSize = 10;
            
            query.setLimit(pageSize);
            query.setOffset(($scope.currentPage - 1) * pageSize);
            
            var qe = qef.createQueryExecution(query);
            var dataPromise = service.ServiceUtils.fetchList(qe, concept.getVar()).pipe(function(nodes) {

                var tagger = constraintTaggerFactory.createConstraintTagger(path);
                
                var r = _(nodes).map(function(node) {
                    var tmp = {
                        path: path,
                        node: node,
                        tags: tagger.getTags(node)
                    };

                    return tmp;
                });

                return r;
            });
            
            var result = {
                countPromise: countPromise,
                dataPromise: dataPromise
            };
            
            return result;
        }
    });
    
})();
