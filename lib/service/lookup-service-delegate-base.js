var LookupService = require('./lookup-service');

var LookupServiceDelegateBase = function(delegate) {
    LookupService.call(this);

    this.initialize(delegate);
};
// inherit
LookupServiceDelegateBase.prototype = Object.create(LookupService.prototype);
// hand back the constructor
LookupServiceDelegateBase.prototype.constructor = LookupServiceDelegateBase;

LookupServiceDelegateBase.prototype.initialize = function(delegate) {
    this.delegate = delegate;
};

LookupServiceDelegateBase.prototype.getIdStr = function(id) {
    var result = this.delegate.getIdStr(id);
    return result;
};

module.exports = LookupServiceDelegateBase;