var Class = require('../../ext/Class');

/**
 * A FacetService is a factory for list services based on {jassa.facete.Path} objects.
 */
var FacetService = Class.create({
    createListService: function(pathHead) { // TODO Maybe replace arguments with the PathHead object?
        throw new Error('Not overridden');
    }
});

module.exports = FacetService;