var Class = require('../../ext/Class');
var HashMap = require('./HashMap');

var HashBidiMap = Class.create({
    initialize: function(fnEquals, fnHash, inverseMap) {
        this.forward = new HashMap(fnEquals, fnHash);
        this.inverse = inverseMap ? inverseMap : new HashBidiMap(fnEquals, fnHash, this);
    },

    getInverse: function() {
        return this.inverse;
    },

    put: function(key, val) {
        this.remove(key);

        this.forward.put(key, val);
        this.inverse.forward.put(val, key);
    },

    remove: function(key) {
        var priorVal = this.get(key);

        if (priorVal !== null) {
            this.inverse.forward.remove(priorVal);
        }
        this.forward.remove(key);
    },

    getMap: function() {
        return this.forward;
    },

    get: function(key) {
        var result = this.forward.get(key);
        return result;
    },

    keyList: function() {
        var result = this.forward.keys();
        return result;
    }
});

module.exports = HashBidiMap;
