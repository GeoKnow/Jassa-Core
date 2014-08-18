var Class = require('../../ext/Class');

var ListServiceTransformConcept = require('../../service/list_service/ListServiceTransformConcept');
var FacetService = require('./FacetService');

/**
 * A FacetService is a factory for list services based on {jassa.facete.Path} objects.
 */
var FacetService = Class.create({
    initialize: function(facetService, fnTransform) {
        this.facetService = facetService;
        this.fnTransform = fnTransform;
    },
    
    createListService: function(path, isInverse) { // TODO Maybe replace arguments with the PathHead object?
        var ls = this.facetService.createListService(path, isInverse);
        var result = new ListServiceTransformConcept(ls, this.fnTransform);
        return result;
    },

});

module.exports = FacetService;