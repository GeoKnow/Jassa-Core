var uniq = require('lodash.uniq');
var ArrayUtils = require('../../util/array-utils');
var HashMap = require('../../util/hash-map');
var LookupServiceDelegateBase = require('./lookup-service-delegate-base');

var LookupServiceChunker = function(delegate, maxChunkSize) {
    LookupServiceDelegateBase.call(this, delegate);

    this.initialize(delegate, maxChunkSize);
};
// inherit
LookupServiceChunker.prototype = Object.create(LookupServiceDelegateBase.prototype);
// hand back the constructor
LookupServiceChunker.prototype.constructor = LookupServiceChunker;


LookupServiceChunker.prototype.initialize = function(delegate, maxChunkSize) {
    this.maxChunkSize = maxChunkSize;
};

LookupServiceChunker.prototype.lookup = function(keys) {
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

    var result = $.when.apply(window, promises).pipe(function() {
        var r = new HashMap();
        arguments.forEach(function(map) {
            r.putAll(map);
        });

        return r;
    });

    return result;
};

module.exports = LookupServiceChunker;