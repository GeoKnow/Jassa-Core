var Class = require('../../ext/Class');

var QueryCacheNodeFactory = Class.create({
    createQueryCache: function() { // sparqlService, query, indexExpr) {
        throw new Error('Not overridden');
    },
});

module.exports = QueryCacheNodeFactory;
