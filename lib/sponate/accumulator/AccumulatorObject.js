var Class = require('../ext/Class');

var Accumulator = require('./Accumulator');

var AccumulatorObject = Class.create(Accumulator, {
    classLabel: 'jassa.sponate.AccumulatorObject',

    /**
     * An aggregator factory must have already taken
     * care of initializing the attrToAggr map.
     *
     */
    initialize: function(patternObject, attrToAggr) {
        this.patternObject = patternObject;
        this.attrToAggr = attrToAggr;
    },

    process: function(binding, context) {
        this.attrToAggr.forEach(function(aggr) {
            aggr.process(binding, context);
        });

    },

    getJson: function(retainRdfNodes) {
        var result = {};

        this.attrToAggr.forEach(function(aggr, attr) {
            var json = aggr.getJson(retainRdfNodes);
            result[attr] = json;
        });

        return result;
    },
});

module.exports = AccumulatorObject;
