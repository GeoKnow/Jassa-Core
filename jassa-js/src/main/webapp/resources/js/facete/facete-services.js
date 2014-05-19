(function() {

    var sponate = Jassa.sponate;

    var ns = Jassa.facete;
    
    
    ns.FacetValueService = Class.create({
        initialize: function(sparqlService, facetTreeConfig) {
            this.sparqlService = sparqlService;
            this.facetTreeConfig = facetTreeConfig;
        },
      
        getFacetTreeConfig: function() {
            return this.facetTreeConfig;
        },
        
        createFacetValueFetcher: function(path, filterText, excludeSelfConstraints) {

            excludeSelfConstraints = excludeSelfConstraints || true;
            
            var facetConfig = this.facetTreeConfig.getFacetConfig();

            var facetConceptGenerator = ns.FaceteUtils.createFacetConceptGenerator(facetConfig);
            var concept = facetConceptGenerator.createConceptResources(path, excludeSelfConstraints);
            var constraintTaggerFactory = new ns.ConstraintTaggerFactory(facetConfig.getConstraintManager());
            
            var store = new sponate.StoreFacade(this.sparqlService);
            var labelMap = sponate.SponateUtils.createDefaultLabelMap();
            store.addMap(labelMap, 'labels');
            labelsStore = store.labels;
            
            var criteria = {};
            if(filterText) {
                criteria = {$or: [
                    {hiddenLabels: {$elemMatch: {id: {$regex: filterText, $options: 'i'}}}},
                    {id: {$regex: filterText, $options: 'i'}}
                ]};
            }
            var baseFlow = labelsStore.find(criteria).concept(concept, true);

            var result = new ns.FacetValueFetcher(baseFlow, this.facetTreeConfig, path);
            return result;
        }
    });

    
    ns.FacetValueFetcher = Class.create({
                
        initialize: function(baseFlow, facetTreeConfig, path) {
            this.baseFlow = baseFlow;
            this.facetTreeConfig = facetTreeConfig;
            this.path = path;
        },
        
        fetchCount: function() {
            var countPromise = this.baseFlow.count();
            return countPromise;
        },
        
        fetchData: function(offset, limit) {
            
            var dataFlow = this.baseFlow.skip(offset).limit(limit);

            var self = this;

            var dataPromise = dataFlow.asList(true).pipe(function(docs) {
                var path = self.path;
                
                var facetConfig = self.facetTreeConfig.getFacetConfig();
                var constraintTaggerFactory = new ns.ConstraintTaggerFactory(facetConfig.getConstraintManager());
                
                var tagger = constraintTaggerFactory.createConstraintTagger(path);
                
                var r = _(docs).map(function(doc) {
                    // TODO Sponate must support retaining node objects
                    //var node = rdf.NodeFactory.parseRdfTerm(doc.id);
                    var node = doc.id;
                    
                    var label = doc.displayLabel ? doc.displayLabel : '' + doc.id;
                    //console.log('displayLabel', label);
                    var tmp = {
                        displayLabel: label,
                        path: path,
                        node: node,
                        tags: tagger.getTags(node)
                    };

                    return tmp;
                    
                });

                return r;
            });
            
            return dataPromise;
        }
    });

    
    
    
/*    
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
  
*/

})();
