var Class = require('../../ext/Class');
var ElementSupplier = require('./ElementSupplier');

/**
 * Element factory returning an initially provided object
 */
var ElementSupplierConst = Class.create(ElementSupplier, {
    initialize: function(element) {
        this.element = element;
    },

    getElement: function() {
        return this.element;
    },

    setElement: function(element) {
        this.element = element;
    },

});

module.exports = ElementSupplierConst;
