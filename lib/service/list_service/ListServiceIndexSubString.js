var Class = require('../../ext/Class');
var PageExpandUtils = require('../PageExpandUtils');
var ListService = require('./ListService');

// TODO str could subsume already existing entries
// So after doing a lookup, we could delete all subsumed items
// We can even cancel running promises!

// TODO We need to deal with promises:
// If for a given search string there already exists a promise for the exact same string
// we can just 'connect' to the running promise
// If there is none, we just start a new request
// If however our str is a substring of a running promise's search string,
// we can either connect or create a new request -> support both options

// There is too much data to fetch all at once
// We should we do?

// For new we could just use the limit/offset that was provided
// but actually we would like to limit the search with a rowLimit
// in regard to 'unreliable' filters (i.e. limiting the set of rows
// before regex and other filter which are hardly indexed)
// But this transformation could be done on the SparqlService level.
// well, or anytime-timeout


var ListServiceIndexSubString = Class.create(ListService, {
    initialize: function(delegate, filterSupplierFn, countThreshold, itemLimit, rowLimit) {
        this.delegate = delegate;

        this.filterSupplierFn = filterSupplierFn;
        this.countThreshold = countThreshold || 1000;
        this.itemLimit = itemLimit;
        this.rowLimit = rowLimit;

        this.strToPromise = {};

        // Mapping from substring to the candidates
        // TODO: Add support the 'empty' word (i.e. null)
        // promise can be: a promise for running requests, an array for cached results,
        //this.strToItems = [];
    },

    getBestCandKey: function(str) {        // Check if any of the strToItem arrays matches
        str = str || '';
        var keys = Object.keys(this.strToPromise);

        var self = this;

        var cands = keys.filter(function(key) {
            var isCand = str.indexOf(key) !== -1;
            return isCand;
        });

        // Get the candidate having the least items or a running promise
        var bestCandKey = null;
        var bestCandSize = null;
        cands.forEach(function(cand) {

            var promise = self.strToPromise[cand];
            if(promise.isFulfilled()) {
                var v = promise.value();
                var n = v ? v.length : null;
                if(bestCandSize == null || (n && n < bestCandSize)) {
                    bestCandKey = cand;
                    bestCandSize = n;
                }
            } else { // Rejected or pending
                // Connect to the promise unless we already have a candidate with explicit items
                // or our key is more specific than a prior candidate key
                // E.g. we search for abc, and we find promises for a and ab, then we take ab
                // If we query for abc and there is both ab and bc ->
                if(bestCandSize == null && str.indexOf(bestCandKey) !== -1) {
                    bestCandKey = str;
                }
            }
        });

        return bestCandKey;
    },

    filterEntries: function(str, entries) {
        var filterFn = this.filterSupplierFn(str);
        var result = entries.filter(filterFn);
        return result;
    },

    fetchItems: function(str, limit, offset) {
        var self = this;
        var globalPromise = this.strToPromise[''];

        if(globalPromise == null || globalPromise.isRejected()) {
            globalPromise = this.fetchItemsForStr(null);
        }

        var result =
            globalPromise
            .then(function(entries) {
                var r = entries || (str != null && self.fetchItemsForStr(str));
                return r;
            }).then(function(entries) {

              var start = offset || 0;
              var end = start + (limit || entries.length);

                var r = entries
                    ? self.filterEntries(str, entries).slice(start, end)
                    : self.delegate.fetchItems(str, limit, offset)
                    ;

                return r;
            });

        return result;
    },

    /*
    fetchItemsForGlobal: function() {
        var self = this;

        var result =
            this.delegate.fetchCount(null, this.itemLimit, this.rowLimit)
            .then(function(countInfo) {
                var r = countInfo.hasMoreItems === false
                    ? self.delegate.fetchItems()
                    : null
                    ;
                return r;
            });
        return result;
    },
    */


    fetchItemsForStr: function(str) {
        var bestCandKey = this.getBestCandKey(str);

        var result = bestCandKey
            ? this.strToPromise[bestCandKey]
            : result = this.fetchForStr(str)
            ;

        return result;
    },

    removeSubsumedStrs: function(str) {
        var self = this;
        // Remove any subsumed entries and kill promises
        var keys = Object.keys(this.strToPromise);
        keys.forEach(function(key) {
            if(str !== key && key.indexOf(str) !== -1) {
// var promise = self.strToPromise[key];
// TODO If we cancelled the existing promise, we should transparently switch to our new one!
// if(promise.isCancellable()) {
//                    promise.cancel();
//                }
                delete self.strToPromise[key];
            }
        });

    },

    fetchForStr: function(str) {
        var self = this;

        if(str === '') {
            str = null;
        }

        // We can try a global count first, and then decide whether we
        // have to go
        var result = this.delegate.fetchCount(str, this.itemLimit, this.rowLimit).then(function(countInfo) {

            var r = null;
            // Check if the count is below the threshold
            if(countInfo.hasMoreItems === false && countInfo.count < self.countThreshold) {
                // Fetch items for indexing
                r = self.delegate.fetchItems(str).then(function(entries) {
                    self.removeSubsumedStrs(str);
                    return entries;
                });

            }

            return r;
        });


        var key = str || '';
        this.strToPromise[key] = result;

        return result;
    },


    fetchCount: function(str, itemLimit, rowLimit) {
        var self = this;
        var bestCandKey = this.getBestCandKey(str);

        var result;

        if(bestCandKey != null) {
            var promise = this.strToPromise[bestCandKey];

            // If the promise is still running, there is a chance that it fails
            // to retrieve items

            result = promise.then(function(entries) {
                var r;

                if(!entries) {
                    // TODO In the meantime there might already
                    // be another candidate promise to which we could connect
                    r = self.delegate.fetchCount(str, itemLimit, rowLimit);
                } else {
                    var filtered = self.filterEntries(str, entries);
                    r = {
                        count: filtered.length,
                        hasMoreItems: false
                    };
                }

                return r;
            });
        } else {
            result = this.delegate.fetchCount(str, itemLimit, rowLimit);
        }

        return result;
    }
});


module.exports = ListServiceIndexSubString;
