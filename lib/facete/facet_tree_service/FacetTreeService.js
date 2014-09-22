var Class = require('../../ext/Class');

var FacetTreeServiceUtils = require('../FacetTreeServiceUtils');

var FacetTreeService = Class.create({
    initialize: function(facetService, facetTreeConfig) {
        this.facetService = facetService;
        this.facetTreeConfig = facetTreeConfig;
    },

    fetchFacetTree: function(startPath) {
        var result = FacetTreeServiceUtils.fetchFacetTree(this.facetService, this.facetTreeConfig, startPath);
        return result;
    },

});


module.exports = FacetTreeService;
