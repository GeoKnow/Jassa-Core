var Class = require('../../ext/Class');
var LookupServiceDelegateBase = require('./LookupServiceDelegateBase');

var HashMap = require('../../util/collection/HashMap');


// In-place transform the values for the looked up documents
var LookupServiceTransformKey = Class.create(LookupServiceDelegateBase, {
    initialize: function($super, delegate, fnKey) {
        $super(delegate);
        this.fnKey = fnKey;
    },

    lookup: function(keys) {
        var self = this;

        var altToKey = new HashMap();

        keys.forEach(function(key) {
            var alt = self.fnKey(key);

            altToKey.put(alt, key);
        });

        var altKeys = altToKey.keys();

        var result = this.delegate.lookup(altKeys).then(function(map) {
            var r = new HashMap();

            map.entries().forEach(function(entry) {
                var key = altToKey.get(entry.key);
                r.put(key, entry.val);
            });

            return r;
        });

        return result;
    },

});

module.exports = LookupServiceTransformKey;
