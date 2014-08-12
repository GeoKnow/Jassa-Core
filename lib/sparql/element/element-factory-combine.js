var Class = require('../../ext/class');
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
var ElementFactoryCombine = Class.create(ElementFactory, {
    initialize: function(simplify, elementFactories, forceGroup) {
        this.simplify = simplify;
        this.elementFactories = elementFactories;
        this.forceGroup = forceGroup;
    },

    isSimplify: function() {
        return this.simplify;
    },

    getElementFactories: function() {
        return this.elementFactories;
    },

    isForceGroup: function() {
        return this.forceGroup;
    },

    createElement: function() {
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
    },
});

module.exports = ElementFactoryCombine;
