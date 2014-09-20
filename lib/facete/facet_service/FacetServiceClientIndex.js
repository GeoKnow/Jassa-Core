var Class = require('../../ext/Class');

var ListServiceArray = require('../../service/list_service/ListServiceArray');
var ListServiceTransformItem = require('../../service/list_service/ListServiceTransformItem');

/**
 * Helper function to create an in-memory list service with regex keyword search
 * from a list of properties (jassa.rdf.Node) and a labelMap (Map<Node, LabelInfo>).
 *
 *
 */
var createListServiceHelper = function(entries, labelMap) {

    // Create an array of items with info about each property
    var fnLabelInfo = function(key) {
        var labelInfo = labelMap.get(key);

        var r = {
            id: key.getUri(),
            displayLabel: labelInfo ? labelInfo.displayLabel : key.getUri(),
            hiddenLabels: labelInfo ? labelInfo.hiddenLabels : []
        };
        return r;
    };

    var fnFilterSupplier = function(searchString) {
        var result;

        if(searchString != null) {
            var re = new RegExp(searchString, 'mi');

            result = function(entry) {
                var key = entry.key;
                var labelInfo = fnLabelInfo(key);

                var m1 = re.test(labelInfo.id);
                var m2 = m1 || re.test(labelInfo.displayLabel);
                var m3 = m2 || (labelInfo.hiddenLabels && labelInfo.hiddenLabels.some(function(x) { return re.test(x); }));

                return m3;
            };
        } else {
            result = function(entry) { return true; };
        }

        return result;
    };
    //console.log('entries: ' + JSON.stringify(entries));

    // Wrap the list service to return the plain properties again
    var ls = new ListServiceArray(entries, fnFilterSupplier);
    /*
    ls = new ListServiceTransformItem(ls, function(item) {
       return item.id;
    });
    */

    return ls;
};

var createIndexedListService = function(listService, lookupServiceNodeLabels) {

    var result = listService.fetchItems()
        .then(function(entries) {
            var keys = entries.map(function(entry) {
                return entry.key;
            });

            var labelPromise = lookupServiceNodeLabels.lookup(keys);
            return [entries, labelPromise];
        }).spread(function(entries, labelMap) {
            var r = createListServiceHelper(entries, labelMap);
            return r;
        });

    return result;
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
                    var check = listService.fetchCount(null, 500); //, 1000000); // TODO Make configurable
                    return [check, listService];
                })
                .spread(function(checkResult, listService) {
                    //console.log('Count check result: ' + JSON.stringify(checkResult));
                    var r = checkResult.hasMoreItems
                        ? listService
                        : createIndexedListService(listService, self.lookupServiceNodeLabels);
                    return r;
                });


        return result;
    },

});

module.exports = FacetServiceClientIndex;
