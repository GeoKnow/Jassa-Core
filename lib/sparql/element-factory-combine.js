var ElementGroup = require('./element-group');
var ElementFactory = require('./element-factory');

/**
 * Element factory that simplify combines the elements of its sub element factories.
 * Does not do any variable renaming
 *
 * options: {
 *     simplify: Perform some transformations, such as removing duplicates
 *     forceGroup: always return an instance of ElementGroup, even if it would have only a single member
 * }
 *
 *
 * @param options
 * @param elementFactories: Array of elementFactories
 */
var ElementFactoryCombine = function() {
    ElementFactory.call(this);
};

// inherit
ElementFactoryCombine.prototype = Object.create(ElementFactory.prototype);
// hand back the constructor
ElementFactoryCombine.prototype.constructor = ElementFactoryCombine;

ElementFactoryCombine.prototype.initialize = function(simplify, elementFactories, forceGroup) {
    this.simplify = simplify;
    this.elementFactories = elementFactories;
    this.forceGroup = forceGroup;
};

ElementFactoryCombine.prototype.isSimplify = function() {
    return this.simplify;
};

ElementFactoryCombine.prototype.getElementFactories = function() {
    return this.elementFactories;
};

ElementFactoryCombine.prototype.isForceGroup = function() {
    return this.forceGroup;
};

ElementFactoryCombine.prototype.createElement = function() {
    var els = this.elementFactories.map(function(elementFactory) {
        var r = elementFactory.createElement();
        return r;
    });
    var elements = els.filter(function(x) {
        return x !== null;
    });

    var result = new ElementGroup(elements);

    // Simplify the element
    if (this.simplify) {
        result = result.flatten();
    }

    // Remove unneccesary ElementGroup unless it is enforced
    if (!this.forceGroup) {
        var members = result.getArgs();
        if (members.length === 1) {
            result = members[0];
        }
    }

    return result;
};

module.exports = ElementFactoryCombine;