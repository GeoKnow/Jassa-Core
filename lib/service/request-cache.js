var RequestCache = function(executionCache, resultCache) {
    this.initialize(executionCache, resultCache);
};

RequestCache.prototype.initialize = function(executionCache, resultCache) {
    this.executionCache = executionCache ? executionCache : {};
    this.resultCache = resultCache ? resultCache : {};// new Cache(); // FIXME: add Cache thingy
};

RequestCache.prototype.getExecutionCache = function() {
    return this.executionCache;
};

RequestCache.prototype.getResultCache = function() {
    return this.resultCache;
};

module.exports = RequestCache;