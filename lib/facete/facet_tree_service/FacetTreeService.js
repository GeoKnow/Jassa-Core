var Class = require('../../ext/Class');

var FacetTreeServiceHelpers = require('../FacetTreeServiceHelpers');

var FacetTreeService = Class.create({
    initialize: function(facetService, facetTreeState) {
        this.facetService = facetService;
        //this.facetTreeConfig = facetTreeConfig;
        //this.pathToStateFn = pathToStateFn;
        this.facetTreeState = facetTreeState;
    },

    fetchFacetTree: function(startPath) {
        //console.log('FacetTreeServiceUtils: ' + JSON.stringify(FacetTreeServiceUtils));
        //var result = FacetTreeServiceHelpers.fetchFacetTree(this.facetService, this.pathToStateFn, startPath);
        var result = FacetTreeServiceHelpers.fetchFacetTree(this.facetService, this.facetTreeState, startPath);
        return result;
    },

});


module.exports = FacetTreeService;
