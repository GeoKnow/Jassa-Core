var Class = require('../ext/Class');

/**
 * An accumulator computes a value from a set of sparql bindings.
 * This could be a count or an average, or - in the case of Sponate - a JavaScript object.
 */
var Acc = Class.create({
    classLabel: 'jassa.sponate.acc',

    /**
     *
     * @param {jassa.sparql.Binding} binding A sparql.Binding object to be accumulateed by this accumulator
     *
     * @returns
     */
    accumulate: function(binding) {
        throw new Error('override me');
    },

    getValue: function() {
        throw new Error('override me');
    },
    
    getSubAccs: function() {
        throw new Error('override me');
    },

});

module.exports = Acc;
