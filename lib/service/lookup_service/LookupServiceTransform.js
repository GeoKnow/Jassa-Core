var Class = require('../../ext/Class');
var LookupServiceDelegateBase = require('./LookupServiceDelegateBase');

// In-place transform the values for the looked up documents
var LookupServiceTransform = Class.create(LookupServiceDelegateBase, {
    initialize: function($super, delegate, fnTransform) {
        $super(delegate);
        this.fnTransform = fnTransform;
    },

    lookup: function(ids) {
        var fnTransform = this.fnTransform;

        var result = this.delegate.lookup(ids).then(function(map) {

            ids.forEach(function(id) {
                var val = map.get(id);
                var t = fnTransform(val, id);
                map.put(id, t);
            });

            return map;
        });

        return result;
    },
});

module.exports = LookupServiceTransform;
