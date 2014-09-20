var Class = require('../../ext/Class');

var FacetTreeUtils = require('../FacetTreeUtils');

var FacetTreeService = Class.create({
    initialize: function(facetService, facetTreeConfig) {
        this.facetService = facetService;
        this.facetTreeConfig = facetTreeConfig;
    },

    fetchFacetTree: function(startPath) {
        var result = FacetTreeUtils.fetchFacetTree(this.facetService, this.facetTreeConfig, startPath);
        return result;
    },

});


module.exports = FacetTreeService;
