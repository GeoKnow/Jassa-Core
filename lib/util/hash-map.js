var Class = require('../ext/Class');
var defaultEquals = require('./default-equals');
var defaultHashCode = require('./default-hash-code');

var HashMap = Class.create({
    initialize: function(fnEquals, fnHash) {
        this.fnEquals = fnEquals ? fnEquals : defaultEquals;
        this.fnHash = fnHash ? fnHash : defaultHashCode;

        this.hashToBucket = {};
    },

    putAll: function(map) {
        var self = this;
        map.entries().forEach(function(entry) {
            self.put(entry.key, entry.val);
        });

        return this;
    },

    put: function(key, val) {
        var hash = this.fnHash(key);

        var bucket = this.hashToBucket[hash];
        if (bucket === null) {
            bucket = [];
            this.hashToBucket[hash] = bucket;
        }

        var keyIndex = this._indexOfKey(bucket, key);
        if (keyIndex >= 0) {
            bucket[keyIndex].val = val;
            return;
        }

        var entry = {
            key: key,
            val: val,
        };

        bucket.push(entry);
    },

    _indexOfKey: function(bucket, key) {
        if (bucket !== null) {

            for (var i = 0; i < bucket.length; ++i) {
                var entry = bucket[i];

                var k = entry.key;
                if (this.fnEquals(k, key)) {
                    // entry.val = val;
                    return i;
                }
            }

        }

        return -1;
    },

    get: function(key) {
        var hash = this.fnHash(key);
        var bucket = this.hashToBucket[hash];
        var i = this._indexOfKey(bucket, key);
        var result = i >= 0 ? bucket[i].val : null;
        return result;
    },

    remove: function(key) {
        var hash = this.fnHash(key);
        var bucket = this.hashToBucket[hash];
        var i = this._indexOfKey(bucket, key);

        var doRemove = i >= 0;
        if (doRemove) {
            bucket.splice(i, 1);
        }

        return doRemove;
    },

    containsKey: function(key) {
        var hash = this.fnHash(key);
        var bucket = this.hashToBucket[hash];
        var result = this._indexOfKey(bucket, key) >= 0;
        return result;
    },

    keyList: function() {
        var result = [];

        this.hashToBucket.forEach(function(bucket) {
            var keys = [];
            bucket.forEach(function(item) {
                if (item.key) {
                    keys.push(item.key);
                }
            });
            result.push.apply(result, keys);
        });

        return result;
    },

    entries: function() {
        var result = [];

        this.hashToBucket.forEach(function(bucket) {
            result.push.apply(result, bucket);
        });

        return result;
    },

    toString: function() {
        var entries = this.entries();
        var entryStrs = entries.map(function(entry) {
            return entry.key + ': ' + entry.val;
        });
        var result = '{' + entryStrs.join(', ') + '}';
        return result;
    },
});

module.exports = HashMap;
