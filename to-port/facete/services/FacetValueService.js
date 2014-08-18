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
            var labelsStore = store.labels;
            
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
