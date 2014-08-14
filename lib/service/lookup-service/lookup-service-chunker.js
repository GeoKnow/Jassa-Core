var Class = require('../../ext/Class');
var uniq = require('lodash.uniq');
var ArrayUtils = require('../../util/array-utils');
var HashMap = require('../../util/hash-map');
var LookupServiceDelegateBase = require('./lookup-service-delegate-base');
var shared = require('../../util/shared');
var Promise = shared.Promise;

var LookupServiceChunker = Class.create(LookupServiceDelegateBase, {
    initialize: function($super, delegate, maxChunkSize) {
        $super(delegate);
        this.maxChunkSize = maxChunkSize;
    },

    lookup: function(keys) {
        var self = this;

        // Make ids unique
        var ks = uniq(keys, false, function(key) {
            var keyStr = self.getIdStr(key);
            return keyStr;
        });

        var chunks = ArrayUtils.chunk(ks, this.maxChunkSize);

        var promises = chunks.map(function(chunk) {
            var r = self.delegate.lookup(chunk);
            return r;
        });

        var result = Promise.app(promises).then(function() {
            var r = new HashMap();
            arguments.forEach(function(map) {
                r.putAll(map);
            });

            return r;
        });

        return result;
    },
});

module.exports = LookupServiceChunker;
