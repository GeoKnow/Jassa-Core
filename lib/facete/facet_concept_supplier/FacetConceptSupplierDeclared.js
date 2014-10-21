var Class = require('../../ext/Class');

//var Concept = require('../../sparql/Concept');

var FacetConceptSupplierExact = require('./FacetConceptSupplierExact');
var CannedConceptUtils = require('../../sparql/CannedConceptUtils');


// Use the declared properties for the root path
var FacetConceptSupplierDeclared = Class.create(FacetConceptSupplierExact, {
    initialize: function($super, facetConfig) {
        $super(facetConfig);
    },

    getConcept: function($super, pathHead) {
        var facetConfig = this.facetConfig;

        var path = pathHead.getPath();
        var cm = facetConfig.getConstraintManager();
        var baseConcept = facetConfig.getBaseConcept();

        var isSubjectConcept = baseConcept.isSubjectConcept();
        var isEmptyPath = path.isEmpty();
        var isUnconstrained = cm.isEmpty();

        var canUseDeclaredProperties = isSubjectConcept && isEmptyPath && isUnconstrained;

        var result = canUseDeclaredProperties
            ? CannedConceptUtils.createConceptDeclaredProperties(baseConcept.getVar())
            : $super(pathHead)
            ;

        console.log('ARGH: ' + result);

        return result;
    },

});

module.exports = FacetConceptSupplierDeclared;
