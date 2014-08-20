var Class = require('../../ext/Class');

var ListServiceTransformConcept = require('../../service/list_service/ListServiceTransformConcept');
var FacetService = require('./FacetService');

/**
 * This facet service wraps the list service provided by the underlying facet service
 * with a transformation of the filter concept.
 *
 *  This can be used to e.g. turn a keyword search query into a sparql concept making use of bif:contains or regex
 */
var FacetServiceTransformConcept = Class.create({
    initialize: function(facetService, fnTransform) {
        this.facetService = facetService;
        this.fnTransform = fnTransform;
    },

    createListService: function(pathHead) { // TODO Maybe replace arguments with the PathHead object?
        var promise = this.facetService.createListService(pathHead);
        var self = this;
        var result = promise.then(function(ls) {
            var r = new ListServiceTransformConcept(ls, self.fnTransform);
            return r;
        });

        return result;
    },

});

module.exports = FacetServiceTransformConcept;
