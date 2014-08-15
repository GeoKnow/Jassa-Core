var Class = require('../../ext/Class');
var _uniq = require('lodash.uniq');
var LookupServiceDelegateBase = require('./LookupServiceDelegateBase');
var RequestCache = require('../RequestCache');
var HashMap = require('../../util/collection/HashMap');
var shared = require('../../util/shared');
var Promise = shared.Promise;

/**
 * This function must convert ids to unique strings
 * Only the actual service (e.g. sparql or rest) needs to implement it
 * Layers on top of it (e.g. caching, delaying) will then delegate to the
 * inner-most getIdStr function.
 *
 */
var LookupServiceCache = Class.create(LookupServiceDelegateBase, {
    initialize: function($super, delegate, requestCache) {
        $super(delegate);
        this.requestCache = requestCache || new RequestCache();
    },

    /**
     * This method must return a promise for the documents
     */
    lookup: function(ids) {
        var self = this;

        // console.log('cache status [BEFORE] ' + JSON.stringify(self.requestCache));

        // Make ids unique
        var uniq = _uniq(ids, false, function(id) {
            var idStr = self.getIdStr(id);
            return idStr;
        });

        var resultMap = new HashMap();

        var resultCache = this.requestCache.getResultCache();
        var executionCache = this.requestCache.getExecutionCache();

        // Check whether we need to wait for promises that are already executing
        var open = [];
        var waitForIds = [];
        var waitForPromises = [];

        uniq.forEach(function(id) {
            var idStr = self.getIdStr(id);

            var data = resultCache.getItem(idStr);
            if (!data) {

                var promise = executionCache[idStr];
                if (promise) {
                    waitForIds.push(id);

                    var found = waitForPromises.find(function(p) {
                        var r = (p === promise);
                        return r;
                    });

                    if (!found) {
                        waitForPromises.push(promise);
                    }
                } else {
                    open.push(id);
                    waitForIds.push(id);
                }
            } else {
                resultMap.put(id, data);
            }
        });

        if (open.length > 0) {
            var p = this.fetchAndCache(open);
            waitForPromises.push(p);
        }

        var result = Promise.all(waitForPromises).then(function() {
            var maps = arguments;
            waitForIds.forEach(function(id) {

                var data = null;
                maps.find(function(map) {
                    data = map.get(id);
                    return Boolean(data);
                });

                if (data) {
                    resultMap.put(id, data);
                }
            });

            return resultMap;
        });

        return result;
    },

    /**
     * Function for actually retrieving data from the underlying service and updating caches as needed.
     *
     * Don't call this method directly; it may corrupt caches!
     */
    fetchAndCache: function(ids) {
        var resultCache = this.requestCache.getResultCache();
        var executionCache = this.requestCache.getExecutionCache();

        var self = this;

        var p = this.delegate.lookup(ids);
        var result = p.then(function(map) {

            var r = new HashMap();

            ids.forEach(function(id) {
                // var id = self.getIdFromDoc(doc);
                var idStr = self.getIdStr(id);
                var doc = map.get(id);
                resultCache.setItem(idStr, doc);
                r.put(id, doc);
            });

            ids.forEach(function(id) {
                var idStr = self.getIdStr(id);
                delete executionCache[idStr];
            });

            return r;
        });

        ids.forEach(function(id) {
            var idStr = self.getIdStr(id);
            executionCache[idStr] = result;
        });

        return result;
    },
});

module.exports = LookupServiceCache;
