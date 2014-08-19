var Class = require('../../ext/Class');
var LookupServiceDelegateBase = require('./LookupServiceDelegateBase');

// In-place transform the values for the looked up documents
var LookupServiceTransform = Class.create(LookupServiceDelegateBase, {
    initialize: function($super, delegate, fnTransform, fnNullHandler) {
        $super(delegate);
        this.fnTransform = fnTransform;
        this.fnNullHandler = fnNullHandler;
    },

    lookup: function(ids) {
        var fnTransform = this.fnTransform;
        var fnNullHandler = this.fnNullHandler;
        
        var result = this.delegate.lookup(ids).then(function(map) {

            ids.forEach(function(id) {
                var val = map.get(id);
                if(val != null) {
                    var t = fnTransform(val, id);
                    map.put(id, t);
                } else if (fnNullHandler) {
                    val = fnNullHandler(id);
                    if(val != null) {
                        map.put(id, val);
                    }
                    //console.log('Null value in transformation for key ' + id, id);
                    
                }
            });

            return map;
        });

        return result;
    },

});

module.exports = LookupServiceTransform;
