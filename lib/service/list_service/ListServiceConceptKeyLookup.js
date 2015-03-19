var values = require('lodash.values');

var Class = require('../../ext/Class');
var ListService = require('./ListService');
var ServiceUtils = require('../ServiceUtils');
var shared = require('../../util/shared');
var Promise = shared.Promise;
var ConceptUtils = require('../../sparql/ConceptUtils');

var ObjectUtils = require('../../util/ObjectUtils');


/**
 * Uses the keys returned by a listService for a given concept
 * to make requests to a lookupService.
 *
 */
var ListServiceConceptKeyLookup = Class.create(ListService, {
    /**
     *
     * @param keyFn Function to extract the keys from the items returned by the list service
     * @param resolveFn Function to control how to combine data returned from the list service and that returned from the lookup service
     */
    initialize: function(keyListService, keyLookupService, keyFn, resolveFn, isLeftJoin) {
        this.keyListService = keyListService;
        this.keyLookupService = keyLookupService;
        this.keyFn = keyFn || function(entry) { return entry.key; };
        this.resolveFn = resolveFn || function(entry, lookup) { ObjectUtils.extend(entry.val || entry, lookup); return entry; };
        this.isLeftJoin = isLeftJoin == null ? true : isLeftJoin;
    },

    fetchItems: function(concept, limit, offset) {
        var self = this;

        var result = Promise
            .resolve(this.keyListService.fetchItems(concept, limit, offset))
            .then(function(entries) {
                var keys = entries.map(self.keyFn);
                return [entries, self.keyLookupService.lookup(keys)];
             }).spread(function(entries, map) {
                var r = entries.map(function(entry) {
                    var key = self.keyFn(entry);
                    var lookup = map.get(key);

                    var s = self.resolveFn(entry, lookup);
                    return s;
                });

                // console.log('argh' + JSON.stringify(r));
                // var r = map.entries();
                return r;
             });

        return result;
    },

    fetchCount: Promise.method(function(concept, itemLimit, rowLimit) {
        var result;
        if (this.isLeftJoin) {
            result = this.keyListService.fetchCount(concept, itemLimit, rowLimit);
        } else {
            var self = this;

            result = this.keyListService.fetchItems(concept, itemLimit)
                .then(function(items) {
                    var keys = items.map(self.keyFn);

                    return self.keyLookupService.lookup(keys);
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
