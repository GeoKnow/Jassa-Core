var Class = require('../../ext/Class');

var Order = Class.create({
    initialize: function(property, _isAscending) {
        this.property = property;
        this._isAscending = _isAscending;
    },

    isAscending: function() {
        return this._isAscending;
    }
});

module.exports = Order;
