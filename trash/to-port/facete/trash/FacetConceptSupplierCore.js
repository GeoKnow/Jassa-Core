
// This would not work, as it is the service's concern how to obtain the concepts
var FacetConceptSupplier = Class.create({

    initialize: function(facetConfig) {
        this.facetConfig = facetConfig;
    },

    createConceptResources: function(path, excludeSelfConstraints) {
        var result = FacetConceptUtils.createConceptResources(path, excludeSelfConstraints);
        return result;
    },

    createConceptFacets: function(path, isInverse) {
        console.log('Not overridden');
        throw 'Not overridden';
    },

    createConceptFacetValues: function(path, isInverse) {
        console.log('Not overridden');
        throw 'Not overridden';
    },

});