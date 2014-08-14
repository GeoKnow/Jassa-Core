var Class = require('../../ext/Class');
var LookupService = require('./lookup-service');

var LookupServiceDelegateBase = Class.create(LookupService, {
    initialize: function(delegate) {
        this.delegate = delegate;
    },

    getIdStr: function(id) {
        var result = this.delegate.getIdStr(id);
        return result;
    },
});

module.exports = LookupServiceDelegateBase;
