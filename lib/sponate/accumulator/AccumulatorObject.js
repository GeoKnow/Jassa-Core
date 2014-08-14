var Class = require('../ext/class');

AccumulatorObject = Class.create(Accumulator, {
    classLabel: 'AggregatorObject',

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
        _(this.attrToAggr).each(function(aggr, attr) {
            aggr.process(binding, context);
        });

    },

    getJson: function(retainRdfNodes) {
        var result = {};

        _(this.attrToAggr).each(function(aggr, attr) {
            var json = aggr.getJson(retainRdfNodes);
            result[attr] = json;
        });

        return result;
    },
});

modul.exports = AccumulatorObject;
