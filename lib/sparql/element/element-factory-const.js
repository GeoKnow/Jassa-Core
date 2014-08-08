var Class = require('../../ext/class');
var ElementFactory = require('./element-factory');

/**
 * Element factory returning an initially provided object
 */
var ElementFactoryConst = Class.create(ElementFactory, {
    initialize: function(element) {
        this.element = element;
    },

    createElement: function() {
        return this.element;
    },
});

module.exports = ElementFactoryConst;
