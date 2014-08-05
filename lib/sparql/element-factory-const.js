var ElementFactory = require('./element-factory');

/**
 * Element factory returning an initially provided object
 */
var ElementFactoryConst = function(element) {
    ElementFactory.call(this);

    this.initialize(element);
};
// inherit
ElementFactoryConst.prototype = Object.create(ElementFactory.prototype);
// hand back the constructor
ElementFactoryConst.prototype.constructor = ElementFactoryConst;

ElementFactoryConst.prototype.initialize = function(element) {
    this.element = element;
};

ElementFactoryConst.prototype.createElement = function() {
    return this.element;
};



module.exports = ElementFactoryConst;