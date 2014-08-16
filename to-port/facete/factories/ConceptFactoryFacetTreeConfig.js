

    ns.ConceptFactoryFacetTreeConfig = Class.create(ns.ConceptFactory, {
        initialize: function(facetTreeConfig, path, excludeSelfConstraints) {
            this.facetTreeConfig = facetTreeConfig;
            this.path = path || new facete.Path();
            this.excludeSelfConstraints = excludeSelfConstraints;
        },
        
        setPath: function(path) {
            this.path = path;
        },
        
        getPath: function() {
            return this.path;
        },
        
        getFacetTreeConfig: function() {
            return this.facetTreeConfig;
        },
        
        setFacetTreeConfig: function(facetTreeConfig) {
            this.facetTreeConfig = facetTreeConfig;
        },

        isExcludeSelfConstraints: function() {
            return this.excludeSelfConstraints;
        },
        
        setExcludeSelfConstraints: function(excludeSelfConstraints) {
            this.excludeSelfConstraints = excludeSelfConstraints;
        },
        
        createConcept: function() {
            var facetConfig = this.facetTreeConfig.getFacetConfig();
            
            var facetConceptGenerator = ns.FaceteUtils.createFacetConceptGenerator(facetConfig);
            var result = facetConceptGenerator.createConceptResources(this.path, this.excludeSelfConstraints);          
            return result;
        }   
    });