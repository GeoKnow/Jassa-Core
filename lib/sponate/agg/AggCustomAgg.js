var Class = require('../ext/Class');

var Agg = require('./Agg');

var AggCustomAgg = Class.create(Agg, {
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

module.exports = AggCustomAgg;
