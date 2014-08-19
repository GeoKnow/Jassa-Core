var Class = require('../../ext/Class');

var HashMap = require('../../util/collection/HashMap');

var FacetUtils = require('../FacetUtils');
var FacetConceptSupplier = require('./FacetConceptSupplier');

var FacetConceptSupplierMeta = Class.create({
    initialize: function(facetConceptSupplierFallback, pathHeadToConcept) {
        this.facetConceptSupplierFallback = facetConceptSupplierFallback;
        this.pathHeadToConcept = pathHeadToConcept || new HashMap();
    },

    getPathHeadToConcept: function() {
        return this.pathHeadToConcept;
    },

    getConcept: function(pathHead) {
        var override = this.pathHeadToConcept.get(pathHead);
        var result = override || this.facetConceptSupplierFallback.getConcept(pathHead);
        return result;
    },

});

module.exports = FacetConceptSupplierMeta;
