var Class = require('../../ext/Class');
var QueryCacheNodeFactory = require('./query-cache-NodeFactory');
var QueryCacheBindingHashSingle = require('./query-cache-binding-hash-single');

var QueryCacheNodeFactoryImpl = Class.create(QueryCacheNodeFactory, {
    initialize: function() {
        this.keyToCache = {}; // new Cache(); // FIXME: add Cache thingy (currently depends on localstorage)
    },

    createQueryCache: function(sparqlService, query, indexExpr) {
        // FIXME: SparqlService.getServiceState() not defined
        var key = 'cache:/' + sparqlService.getServiceId() + '/' + sparqlService.getServiceState() + '/' + query + '/' + indexExpr;

        console.log('cache requested with id: ' + key);

        var cache = this.keyToCache.getItem(key);
        if (cache === null) {
            cache = new QueryCacheBindingHashSingle(sparqlService, query, indexExpr);
            this.keyToCache.addItem(key, cache);
        }

        return cache;
    },
});

module.exports = QueryCacheNodeFactoryImpl;
