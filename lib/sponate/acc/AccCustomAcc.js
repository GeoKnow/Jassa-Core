var Class = require('../ext/Class');

var Acc = require('./Acc');

var AccCustomAgg = Class.create(Acc, {
    classLabel: 'jassa.sponate.AccCustomAgg',

    initialize: function(aggregatorCustomAgg, customAgg) {
        this.customAgg = customAgg;
        this.aggregatorCustomAgg = aggregatorCustomAgg;
    },

    getAgg: function() {
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

module.exports = AccCustomAgg;
