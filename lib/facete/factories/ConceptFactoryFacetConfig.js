    ns.ConceptFactoryFacetConfig = Class.create(ns.ConceptFactory, {
        initialize: function(facetConfig, path, excludeSelfConstraints) {
            this.facetConfig = facetConfig;
            this.path = path || new facete.Path();
            this.excludeSelfConstraints = excludeSelfConstraints;
        },
        
        createConcept: function() {
            var facetConceptGenerator = ns.FaceteUtils.createFacetConceptGenerator(this.facetConfig);
            var result = facetConceptGenerator.createConceptResources(this.path, this.excludeSelfConstraints);          
            return result;
        }
    });