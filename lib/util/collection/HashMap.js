var forEach = require('lodash.foreach');
var Class = require('../../ext/Class');
var ObjectUtils = require('./../ObjectUtils');

var HashMap = Class.create({
    initialize: function(fnEquals, fnHash) {

        this.fnEquals = fnEquals ? fnEquals : ObjectUtils.isEqual;
        this.fnHash = fnHash ? fnHash : ObjectUtils.hashCode;

        this.hashToBucket = {};

        var self = this;
        this.fnGet = function(key) {
            var r = self.get(key);
            return r;
        };


        Object.defineProperty(this, 'length', {
            get: function() {
                var r = self.entries().length;
                return r;
            }
        });
    },

    clear: function() {
        this.hashToBucket = {};
    },

    putEntry: function(entry) {
        this.put(entry.key, entry.val);
    },

    putEntries: function(entries) {
        var self = this;
        entries.forEach(function(entry) {
            self.putEntry(entry);
        });

        return this;
    },

    // Deprecated - use putMap instead
    putAll: function(map) {
        return this.putMap(map);
    },

    putMap: function(map) {
        var entries = map.entries();
        var result = this.putEntries(entries);
        return result;
    },

    getOrCreate: function(key, initVal) {
        var result;

        var containsKey = this.containsKey(key);
        if(!containsKey) {
            this.put(key, initVal);
            result = initVal;
        } else {
            result = this.get(key);
        }

        return result;
    },

    put: function(key, val) {
        var hash = this.fnHash(key);

        var bucket = this.hashToBucket[hash];
        if (bucket == null) {
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
        if (bucket != null) {

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

    keys: function() {
        var result = [];

        forEach(this.hashToBucket, function(bucket) {
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

    values: function() {
        var entries = this.entries();

        var result = entries.map(function(entry) {
           return entry.val;
        });

        return result;
    },

    entries: function() {
        var result = [];

        forEach(this.hashToBucket, function(bucket) {
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

    /**
     * Returns a function for getting elements
     */
    asFn: function() {
        return this.fnGet;
    },

});

module.exports = HashMap;
