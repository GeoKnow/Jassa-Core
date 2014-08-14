var Class = require('../ext/class');

var Accumulator = require('./Accumulator');

var AccumulatorCustomAgg = Class.create(Accumulator, {
    classLabel: 'jassa.sponate.AccumulatorCustomAgg',

    initialize: function(aggregatorCustomAgg, customAgg) {
        this.customAgg = customAgg;
        this.aggregatorCustomAgg = aggregatorCustomAgg;
    },

    getAggregator: function() {
        return this.patternCustomAgg;
    },

    process: function(binding, context) {
        this.customAgg.processBinding(binding);
    },

    getJson: function(retainRdfNodes) {
        var result = this.customAgg.getJson(retainRdfNodes);
        return result;
    },
});

module.exports = AccumulatorCustomAgg;
