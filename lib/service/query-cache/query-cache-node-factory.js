var Class = require('../../ext/class');

var QueryCacheNodeFactory = Class.create({
    createQueryCache: function() { //sparqlService, query, indexExpr) {
        throw 'Not overridden';
    },
});

module.exports = QueryCacheNodeFactory;
