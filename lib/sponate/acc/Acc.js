var Class = require('../ext/Class');

/**
 * An accumulator computes a value from a set of sparql bindings.
 * This could be a count or an average, or - in the case of Sponate - a JavaScript object.
 */
var Acc = Class.create({
    classLabel: 'Agg',

    /**
     * Return the aggregator that created the accumulator
     */
    getAgg: function() {
        throw 'override me';
    },

    /**
     *
     * @param {jassa.sparql.Binding} binding A sparql.Binding object to be processed by this accumulator
     * TODO Define the context param
     *
     * @returns
     */
    process: function(binding, context) {
    },

    getJson: function(retainRdfNodes) {
        throw 'override me';
    },
});

module.exports = Acc;
