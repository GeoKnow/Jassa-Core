var Class = require('../../ext/Class');

var Concept = require('../../sparql/Concept');

var FacetUtils = require('../FacetUtils');
var FacetConceptSupplier = require('./FacetConceptSupplier');


var FacetConceptSupplierExact = Class.create(FacetConceptSupplier, {
    initialize: function(facetConfig) {
        this.facetConfig = facetConfig;
    },
    
    getConcept: function(pathHead) {
        var relation = FacetUtils.createRelationFacets(this.facetConfig, pathHead);
        var result = new Concept(relation.getElement(), relation.getSourceVar());

        return result;
    },

});

module.exports = FacetConceptSupplierExact;
