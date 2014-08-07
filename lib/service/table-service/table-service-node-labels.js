var TableServiceDelegateBase = require('./table-service-delegate-base');
var TableServiceUtils = require('./table-service-utils');

var TableServiceNodeLabels = function(delegate) {
    TableServiceDelegateBase.call(this);

    this.initialize(delegate);
};
// inherit
TableServiceNodeLabels.prototype = Object.create(TableServiceDelegateBase.prototype);
// hand back the constructor
TableServiceNodeLabels.prototype.constructor = TableServiceNodeLabels;

TableServiceNodeLabels.prototype.initialize = function($super, delegate, lookupServiceNodeLabels) {
    $super(delegate);
    this.lookupServiceNodeLabels = lookupServiceNodeLabels;
};

TableServiceNodeLabels.prototype.fetchData = function(limit, offset) {
    var promise = this.delegate.fetchData(limit, offset);

    var self = this;
    var result = promise.then(function(rows) {
        var r = TableServiceUtils.transformToNodeLabels(self.lookupServiceNodeLabels, rows);
        return r;
    });

    return result;
};

module.exports = TableServiceNodeLabels;