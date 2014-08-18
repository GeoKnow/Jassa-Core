var Class = require('../../ext/Class');

/**
 * ConstraintSpecs can be arbitrary objects, however they need to expose the
 * declared paths that they affect.
 * DeclaredPaths are the ones part of spec, affectedPaths are those after considering the constraint's sparql element. 
 * 
 */
var Constraint = Class.create({
    getName: function() {
        throw new Error('Override me');
    },
    
    getDeclaredPaths: function() {
        console.log('[ERROR] Override me');
        throw new Error('Override me');
    },
    
    createElementsAndExprs: function(facetNode) {
        throw new Error('Override me');
    },
    
    equals: function() {
        throw new Error('Override me');
    },
    
    hashCode: function() {
        throw new Error('Override me');
    }
});
    
module.exports = Constraint;
