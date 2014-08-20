var Class = require('../../ext/Class');
var ServiceUtils = require('../ServiceUtils');
var ListService = require('./ListService');

var shared = require('../../util/shared');
var Promise = shared.Promise;


var ListServiceArray = Class.create(ListService, {
    initialize: function(items, fnFilterSupplier) { // fnOutputTransform
        this.items = items;
        this.fnFilterSupplier = fnFilterSupplier; // A function that must accept a 'concept' and return a corresponding filter function

        // For output transformation use ListServiceTransformItem instead
        //this.fnOutputTransform = fnOutputTransform;
    },

    fetchItems: function(concept, limit, offset) {
        var fnFilter = this.fnFilterSupplier(concept);
        var filtered = this.items.filter(fnFilter);

        var start = offset || 0;
        var end = limit ? start + limit : filtered.length;

        var output = filtered.slice(start, end);

//        if(this.fnOutputTransform) {
//            output = output.map(this.fnOutputTransform);
//        }

        return Promise.resolve(output);
    },

    // Note: rowLimit is ignored
    // Also note, that we could change the semantics such that itemLimit actually refers to the set of
    // actually distinct items in this list in regard to a given comparator.
    // Right now we simply treat items as distinct
    fetchCount: function(concept, itemLimit, rowLimit) {
        var fnFilter = this.fnFilterSupplier(concept);
        var filtered = this.items.filter(fnFilter);

        var l = filtered.length;
        var count = Math.min(l, itemLimit);

        var countInfo = {
            count: count,
            hasMoreItems: count < l
        };

        return Promise.resolve(countInfo);
    },

});

module.exports = ListServiceArray;
