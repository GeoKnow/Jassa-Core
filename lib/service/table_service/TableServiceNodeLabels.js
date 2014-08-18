var Class = require('../../ext/Class');
var TableServiceDelegateBase = require('./TableServiceDelegateBase');
var TableServiceUtils = require('../TableServiceUtils');

var TableServiceNodeLabels = Class.create(TableServiceDelegateBase, {
    initialize: function($super, delegate, lookupServiceNodeLabels) {
        $super(delegate);
        this.lookupServiceNodeLabels = lookupServiceNodeLabels;
    },

    fetchData: function(limit, offset) {
        var promise = this.delegate.fetchData(limit, offset);

        var self = this;
        var result = promise.then(function(rows) {
            var r = TableServiceUtils.transformToNodeLabels(self.lookupServiceNodeLabels, rows);
            return r;
        });

        return result;
    },
});

module.exports = TableServiceNodeLabels;
