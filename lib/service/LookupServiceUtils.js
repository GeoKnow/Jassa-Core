var HashMap = require('../util/collection/HashMap');
var shared = require('../util/shared');
var Promise = shared.Promise;

//var LookupServiceSparqlQuery = require('./lookup_service/LookupServiceSparqlQuery'); 

var LookupServiceUtils = {
    /**
     * Yields a promise resolving to an empty array if lookupService or keys are null
     *
     */
    lookup: function(lookupService, keys) {
        var result;

        if (!lookupService || !keys) {
            result = Promise.resolve([]);
        } else {
            result = lookupService.lookup(keys);
        }

        return result;
    },

    /**
     * Create a new promise from a list of keys and corresponding
     * valuePromises
     */
    zip: function(keys, valuePromises) {
        var result = Promise.all(valuePromises).then(function() {
            var r = new HashMap();

            for (var i = 0; i < keys.length; ++i) {
                var bounds = keys[i];
                var docs = arguments[i];

                r.put(bounds, docs);
            }

            return r;
        });

        return result;
    },

    unmapKeys: function(keys, fn, map) {
        var result = new HashMap();

        keys.forEach(function(key) {
            var k = fn(key);

            var v = map.get(k);
            result.put(key, v);
        });

        return result;
    },

    /**
     * Performs a lookup by mapping the keys first
     */
    fetchItemsMapped: function(lookupService, keys, fn) {
        var ks = keys.map(fn);

        var result = lookupService.fetchItems(ks).then(function(map) {
            var r = LookupServiceUtils.unmapKeys(keys, fn, map);
            return r;
        });

        return result;
    },

    fetchCountsMapped: function(lookupService, keys, fn) {
        var ks = keys.map(fn);

        var result = lookupService.fetchCounts(ks).then(function(map) {
            var r = LookupServiceUtils.unmapKeys(keys, fn, map);
            return r;
        });

        return result;
    },


//    createLookupServiceConcept: function(sparqlService, concept) {
//        var v = concept.getVar();
//        var query = ConceptUtils.createQueryList(query);
//        var result = new LookupServiceSparqlQuery(sparqlService, query, v);
//        return result;
//    }
};

module.exports = LookupServiceUtils;
