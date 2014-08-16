var Class = require('../ext/Class');

var Aggregator = require('./Aggregator');

var AggregatorCustomAgg = Class.create(Aggregator, {
    classLabel: 'PatternCustomAgg',

    initialize: function(customAggFactory) {
        this.customAggFactory = customAggFactory;
    },

    getCustomAggFactory: function() {
        return this.customAggFactory;
    },

    getClassName: function() {
        return 'PatternCustomAgg';
    },

    getVarsMentioned: function() {
        var result = this.customAggFactory.getVarsMentioned();
        return result;
    },

    getSubPatterns: function() {
        return [];
    },
});

module.exports = AggregatorCustomAgg;
