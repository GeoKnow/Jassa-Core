var Class = require('../../ext/Class');
var HashMap = require('./HashMap');

var HashSet = Class.create({
    initialize: function(fnEquals, fnHash) {
        this._map = new HashMap(fnEquals, fnHash);

//        var self = this;
//        Object.defineProperty(this, 'length', {
//            get: function() {
//                return self._map.length;
//            }
//        });
    },

    isEmpty: function() {
        var result = this._map.isEmpty();
        return result;
    },

    add: function(item) {
        this._map.put(item, true);
    },

    hashCode: function() {
        var result = this._map.hashCode();
        return result;
    },

    equals: function(that) {
        var result =
            that != null &&
            that._map != null &&
            this._map.equals(that._map);

        return result;
    },
    /*
    clone: function() {
        var result = new HashSet(this.map.fnEquals, this.map.fnHash);

        return result;
    },*/

    contains: function(item) {
        var result = this._map.containsKey(item);
        return result;
    },

    forEach: function(fn) {
        var items = this.entries();
        items.forEach(fn);
    },

    map: function(fn) {
        var items = this.entries();
        var result = items.map(fn);
        return result;
    },

    retainAll: function(otherSet) {
        var self = this;
        this.forEach(function(item) {
            var isContained = otherSet.contains(item);

            if(!isContained) {
                self.remove(item);
            }
        });
    },

    addAll: function(otherSet) {
        var self = this;
        otherSet.forEach(function(item) {
            self.add(item);
        });
    },

    removeAll: function(otherSet) {
        var self = this;
        otherSet.forEach(function(item) {
            self.remove(item);
        });
    },

    remove: function(item) {
        this._map.remove(item);
    },

    entries: function() {
        var result = this._map.entries().map(function(entry) {
            // return entry.getKey();
            return entry.key;
        });

        return result;
    },

    clear: function() {
        this._map.clear();
    },

    toString: function() {
        var entries = this.entries();
        var result = '{' + entries.join(', ') + '}';
        return result;
    },

    size: function() {
        var result = this._map.size();
        return result;
    }
});

module.exports = HashSet;
