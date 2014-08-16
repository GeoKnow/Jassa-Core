var Class = require('../ext/Class');

var RequestCache = Class.create({
    initialize: function(executionCache, resultCache) {
        this.executionCache = executionCache ? executionCache : {};
        this.resultCache = resultCache ? resultCache : {}; // new Cache(); // FIXME: add Cache thingy
    },

    getExecutionCache: function() {
        return this.executionCache;
    },

    getResultCache: function() {
        return this.resultCache;
    },
});

module.exports = RequestCache;
