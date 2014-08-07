var TableService = require('./table-service');

var TableServiceDelegateBase = function(delegate) {
    TableService.call(this);

    this.initialize(delegate);
};
// inherit
TableServiceDelegateBase.prototype = Object.create(TableService.prototype);
// hand back the constructor
TableServiceDelegateBase.prototype.constructor = TableServiceDelegateBase;



TableServiceDelegateBase.prototype.initialize = function(delegate) {
    this.delegate = delegate;
};

TableServiceDelegateBase.prototype.fetchSchema = function() {
    var result = this.delegate.fetchSchema();
    return result;
};

/**
 * Expected to return a promise which yields an integral value for the total number of rows
 */
TableServiceDelegateBase.prototype.fetchCount = function() {
    var result = this.delegate.fetchCount();
    return result;
};

/**
 * Expected to return a promise which yields an array of objects (maps) from field name to field data
 */
TableServiceDelegateBase.prototype.fetchData = function() {
    var result = this.delegate.fetchData();
    return result;
};

module.exports = TableServiceDelegateBase;
