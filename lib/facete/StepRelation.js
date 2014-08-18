var Class = require('../ext/Class');

/**
 * This class is used to relate (constrained) steps to their
 * corresponding relation that implements the constraints.
 *
 * @param {jassa.facete.Step} step
 * @param {jassa.sparql.Relation} relation
 */
var StepRelation = Class.create({

    initialize: function(step, relation) {
        this.step = step;
        this.relation = relation;
    },

    getStep: function() {
        return this.step;
    },

    getRelation: function() {
        return this.relation;
    },

    toString: function() {
        return this.step + ': ' + this.relation;
    },

});

module.exports = StepRelation;
