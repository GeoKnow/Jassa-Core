var Class = require('../../ext/Class');
var TableService = require('./TableService');

var TableServiceDelegateBase = Class.create(TableService, {
    initialize: function(delegate) {
        this.delegate = delegate;
    },

    fetchSchema: function() {
        var result = this.delegate.fetchSchema();
        return result;
    },

    /**
     * Expected to return a promise which yields an integral value for the total number of rows
     */
    fetchCount: function() {
        var result = this.delegate.fetchCount();
        return result;
    },

    /**
     * Expected to return a promise which yields an array of objects (maps) from field name to field data
     */
    fetchData: function() {
        var result = this.delegate.fetchData();
        return result;
    },
});

module.exports = TableServiceDelegateBase;
