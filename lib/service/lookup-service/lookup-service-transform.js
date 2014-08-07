var LookupServiceDelegateBase = require('./lookup-service-delegate-base');

// In-place transform the values for the looked up documents
var LookupServiceTransform = function(delegate, fnTransform) {
    LookupServiceDelegateBase.call(this, delegate);

    this.initialize(delegate, fnTransform);
};
// inherit
LookupServiceTransform.prototype = Object.create(LookupServiceDelegateBase.prototype);
// hand back the constructor
LookupServiceTransform.prototype.constructor = LookupServiceTransform;


LookupServiceTransform.prototype.initialize = function(delegate, fnTransform) {
    this.fnTransform = fnTransform;
};

LookupServiceTransform.prototype.lookup = function(ids) {
    var fnTransform = this.fnTransform;

    var result = this.delegate.lookup(ids).pipe(function(map) {

        ids.forEach(function(id) {
            var val = map.get(id);
            var t = fnTransform(val, id);
            map.put(id, t);
        });

        return map;
    });

    return result;
};

module.exports = LookupServiceTransform;
