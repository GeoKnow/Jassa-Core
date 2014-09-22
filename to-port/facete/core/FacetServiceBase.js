

/**
 * The FacetService can return list services for the facets
 * at given paths.
 * The concept argument of such a list service can be used to
 * filter the set of properties, and can thus implement a keyword filter.
 */
var FacetServiceBase = Class.create({
    initialize: function(sparqlService, facetConfig) {
        this.sparqlService = sparqlService;
        this.facetConfig = facetConfig;
    },

    prepareListService: function(path) {

    }
});