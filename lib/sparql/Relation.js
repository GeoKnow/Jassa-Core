var Class = require('../ext/Class');

/**
 * A (binary) relation represents correspondences between two sets of resources
 *
 * The main intention of relations is to map a concept, such as 'Airports',
 * to a related conecept, such as the set of labels. 
 */
var Relation = Class.create({
    initialize: function(element, sourceVar, targetVar) {
        this.element = element;
        this.sourceVar = sourceVar;
        this.targetVar = targetVar;
    },

    getElement: function() {
        return this.element;
    },

    getSourceVar: function() {
        return this.sourceVar;
    },

    getTargetVar: function() {
        return this.targetVar;
    },

});

module.exports = Relation;
