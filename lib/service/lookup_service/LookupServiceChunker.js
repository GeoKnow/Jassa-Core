var Class = require('../../ext/Class');
var uniq = require('lodash.uniq');
var ArrayUtils = require('../../util/ArrayUtils');
var HashMap = require('../../util/collection/HashMap');
var LookupServiceDelegateBase = require('./LookupServiceDelegateBase');
//var shared = require('../../util/shared');
//var Promise = shared.Promise;

var PromiseUtils = require('../../util/PromiseUtils');

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

        var result = PromiseUtils.all(promises).then(function(args) {
            var r = new HashMap();
            //var args = Array.prototype.slice.call(arguments);
            args.forEach(function(map) {
                r.putMap(map);
            });

            return r;
        });

        return result;
    },
});

module.exports = LookupServiceChunker;
