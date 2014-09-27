var Class = require('../../ext/Class');

var FacetTreeServiceHelpers = require('../FacetTreeServiceHelpers');

var FacetTreeService = Class.create({
    initialize: function(facetService, pathToStateFn) {
        this.facetService = facetService;
        //this.facetTreeConfig = facetTreeConfig;
        this.pathToStateFn = pathToStateFn;
    },

    fetchFacetTree: function(startPath) {
        //console.log('FacetTreeServiceUtils: ' + JSON.stringify(FacetTreeServiceUtils));
        var result = FacetTreeServiceHelpers.fetchFacetTree(this.facetService, this.pathToStateFn, startPath);
        return result;
    },

});


module.exports = FacetTreeService;
