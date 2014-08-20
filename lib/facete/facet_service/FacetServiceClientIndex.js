var Class = require('../../ext/Class');

var ListServiceArray = require('../../service/list_service/ListServiceArray');
var ListServiceTransformItem = require('../../service/list_service/ListServiceTransformItem');

var createListServiceHelper = function(properties, labelMap) {

    // Create an array of items with info about each property
    var items = properties.map(function(property) {
        var labelInfo = labelMap.get(property);

        var r = {
            id: property,
            displayLabel: labelInfo ? labelInfo.displayLabel : property.getUri(),
            hiddenLabels: labelInfo ? labelInfo.hiddenLabels : []
        };
        return r;
    });

    var fnFilterSupplier = function(searchString) {
        var re = new RegExp(searchString, 'mi');

        return function(item) {
            var m1 = re.test(item.id.getUri());
            var m2 = m1 || re.test(item.displayLabel);
            var m3 = m2 || (item.hiddenLabels && item.hiddenLabels.some(function(x) { return re.test(x); }));

            return m3;
        };
    };

    // Wrap the list service to return the plain properties again
    var ls = new ListServiceArray(items, fnFilterSupplier);
    ls = new ListServiceTransformItem(ls, function(item) {
       return item.id;
    });

    return ls;
};

/**
 *
 * This strategy first retrieves all properties from the underlying service,
 * then fetches their labels, and finally creates a list service that
 * performs the lookup on this in-memory cache
 *
 */
var FacetServiceClientIndex = Class.create({

    /**
     * Upon request, this facet service will retrieve *all* facets together
     * with their labels. Filtering will then happen in the client.
     *
     * @param {jassa.facete.FacetService} The underlying facetService
     *
     */
    initialize: function(facetService, lookupServiceNodeLabels) {
        this.facetService = facetService;
        this.lookupServiceNodeLabels = lookupServiceNodeLabels;
    },


    /**
     *
     * @return {Promise<ListService[String]>} The returned list service accepts a search string
     */
    createListService: function(pathHead) {
        var self = this;

        var result =
            this.facetService.createListService(pathHead)
                .then(function(listService) {
                    var r =listService.fetchItems();
                    return r;
                }).then(function(properties) {
                    var labelPromise = self.lookupServiceNodeLabels.lookup(properties);
                    return [properties, labelPromise];
                }).spread(function(properties, labelMap) {
                    var r = createListServiceHelper(properties, labelMap);
                    return r;
                });


        return result;
    },

});

module.exports = FacetServiceClientIndex;
