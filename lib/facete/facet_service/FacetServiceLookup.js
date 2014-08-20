var Class = require('../../ext/Class');

var FacetService = require('./FacetService');

var HashMap = require('../../util/collection/HashMap');

var ListServiceConceptKeyLookup = require('../../service/list_service/ListServiceConceptKeyLookup');
var ListServiceTransformItem = require('../../service/list_service/ListServiceTransformItem');

/**
 * A facet service that can override lookups for pathHeads to other facet services
 *
 */
var FacetServiceLookup = Class.create(FacetService, {
    /**
     * @param fnLookupService A function that yields a lookup service for a pathHead
     */
    initialize: function(facetService, fnLookupService) {
        this.facetService = facetService;
        this.fnLookupService = fnLookupService;
    },

    createListService: function(pathHead) {
        var lookupService = this.fnLookupService(pathHead);

        var result = this.facetService.createListService(pathHead).then(function(ls) {
            ls = new ListServiceConceptKeyLookup(ls, lookupService);
            ls = new ListServiceTransformItem(ls, function(item) {
                return item.val;
            });

            return ls;
        });

        return result;
    },

});

module.exports = FacetServiceLookup;
