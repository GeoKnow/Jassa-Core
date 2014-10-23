var Class = require('../../ext/Class');
var ElementSupplier = require('./ElementSupplier');

/**
 * Element factory returning an element based on a function
 */
var ElementSupplierFn = Class.create(ElementSupplier, {
    initialize: function(elementFn) {
        this.elementFn = elementFn;
    },

    getElement: function() {
        return this.elementFn;
    },
});

module.exports = ElementSupplierFn;
