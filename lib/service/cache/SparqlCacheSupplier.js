var forEach = require('lodash.foreach');

var Class = require('../../ext/Class');

var ObjectUtils = require('../../util/ObjectUtils');
var HashMap = require('../../util/collection/HashMap');

var CacheSimple = require('./CacheSimple');


var SparqlCacheSupplier = Class.create({
    initialize: function() {
        this.serviceToGraphsToCache = {};
    },

    getCache: function(serviceIri, graphIris) {
        var graphsToCache = this.serviceToGraphsToCache[serviceIri];

        if(!graphsToCache) {
            graphsToCache = new HashMap();
            this.serviceToGraphsToCache[serviceIri] = graphsToCache;
        }

        var cache = graphsToCache.get(graphIris);
        if(!cache) {
            cache = new CacheSimple();
            graphsToCache.put(graphIris, cache);
        }

        var result = cache;

        return result;
    },

    /**
     * If the graphIris argument is falsy, all caches for the service
     * will be invalidated. Otherwise, all caches that reference any of these
     * graphs will be invalidated
     *
     * A question is: should invalidation of a cache also delete the corresponding cache objects?
     * Or should the cache objects be retained, as they might still be referenced elsewhere?
     *
     * If it is acceptable to retain references, then the cache should probably provide an event api
     * (i.e. on('invalidate', ...) on('insert', ...)
     *
     * @param serviceIri The affected sparql service IRI
     * @param graphIris The affected graphIris, null to affect all
     * @param deleteEntries If false, references to cache objects will remain valid, otherwise, the supplier
     */
    invalidate: function(serviceIri, graphIris, deleteEntries) {
        if(!serviceIri) {
            // Clear the whole cache
            forEach(this.serviceToGraphsToCache, function(graphsToCache) {
                graphsToCache.entries().forEach(function(entry) {
                    var cache = entry.val;
                    cache.clear();
                });
            });

        } else {
            if(!graphIris) {

                // Clear all caches for the given service
                var graphsToCache = this.serviceToGraphsToCache[serviceIri];
                if(graphsToCache) {
                    graphsToCache.entries().forEach(function(entry) {
                        var cache = entry.val;
                        cache.clear();
                    });
                }
            } else {
                var cache = this.serviceToGraphsToCache[serviceIri];
                if(cache) {
                    cache.clear();
                }
            }
        }
    }

});

module.exports = SparqlCacheSupplier;
