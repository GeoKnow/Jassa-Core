var values = require('lodash.values');

var Class = require('../../ext/Class');
var ListService = require('./ListService');
var ServiceUtils = require('../ServiceUtils');
var shared = require('../../util/shared');
var Promise = shared.Promise;
var ConceptUtils = require('../../sparql/ConceptUtils');

/**
 * Uses the keys returned by a listService for a given concept
 * to make requests to a lookupService.
 *
 */
var ListServiceConceptKeyLookup = Class.create(ListService, {
    initialize: function(keyListService, keyLookupService, isLeftJoin) {
        this.keyListService = keyListService;
        this.keyLookupService = keyLookupService;
        this.isLeftJoin = isLeftJoin == null ? true : isLeftJoin;
    },

    fetchItems: Promise.method(function(concept, limit, offset) {
        var self = this;

        var result = this.keyListService.fetchItems(concept, limit, offset)
            .then(function(entries) {
                var keys = entries.map(function(entry) {
                    return entry.key;
                });

                return self.keyLookupService.lookup(keys);
             }).then(function(map) {
                //var entries = map.entries();
                //var r = values(entries);
                var r = map.entries();
                return r;
             });

        return result;
    }),

    fetchCount: Promise.method(function(concept, itemLimit, rowLimit) {
        var result;
        if (this.isLeftJoin) {
            result = this.keyListService.fetchCount(concept, itemLimit, rowLimit);
        } else {
            var self = this;

            result = this.keyListService.fetchItems(concept, itemLimit)
                .then(function(items) {
                    return self.keyLookupService.lookup(items);
                }).then(function(map) {
                    var keyList = map.keys();
                    var count = keyList.length;

                    var r = {
                        count: count,
                        hasMoreItems: itemLimit == null ? false : null // absence of a value indicates 'unknown'
                    };

                    return r;
                });
        }

        return result;
    }),

});

module.exports = ListServiceConceptKeyLookup;
