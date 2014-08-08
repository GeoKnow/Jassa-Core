var Class = require('../../ext/class');
var TableServiceDelegateBase = require('./table-service-delegate-base');
var TableServiceUtils = require('./table-service-utils');

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