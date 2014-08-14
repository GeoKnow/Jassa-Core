var Class = require('../../ext/Class');

var QueryCacheNodeFactory = Class.create({
    createQueryCache: function() { // sparqlService, query, indexExpr) {
        throw 'Not overridden';
    },
});

module.exports = QueryCacheNodeFactory;
