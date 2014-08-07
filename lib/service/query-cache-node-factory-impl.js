var QueryCacheNodeFactory = require('./query-cache-node-factory');
var QueryCacheBindingHashSingle = require('./query-cache-binding-hash-single');

var QueryCacheNodeFactoryImpl = function(source) {
    QueryCacheNodeFactory.call(this);

    this.initialize(source);
};
// inherit
QueryCacheNodeFactoryImpl.prototype = Object.create(QueryCacheNodeFactory.prototype);
// hand back the constructor
QueryCacheNodeFactoryImpl.prototype.constructor = QueryCacheNodeFactoryImpl;

QueryCacheNodeFactoryImpl.prototype.initialize = function() {
    this.keyToCache = new Cache(); // FIXME: add Cache thingy
};

QueryCacheNodeFactoryImpl.prototype.createQueryCache = function(sparqlService, query, indexExpr) {
    // FIXME: SparqlService.getServiceState() not defined
    var key = 'cache:/' + sparqlService.getServiceId() + '/' + sparqlService.getServiceState() + '/' + query + '/' + indexExpr;

    console.log('cache requested with id: ' + key);

    var cache = this.keyToCache.getItem(key);
    if (cache === null) {
        cache = new QueryCacheBindingHashSingle(sparqlService, query, indexExpr);
        this.keyToCache.addItem(key, cache);
    }

    return cache;
};

module.exports = QueryCacheNodeFactoryImpl;
