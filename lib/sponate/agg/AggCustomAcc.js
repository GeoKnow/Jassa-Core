var Class = require('../ext/Class');

var Agg = require('./Agg');

/**
 * Aggregator for custom functions.
 * 
 */
var AggCustomAgg = Class.create(Agg, {
    classLabel: 'jassa.sponate.AggCustomAgg',

    /**
     * 
     * @param 
     */
    initialize: function(fnAcc) {
        this.fnAcc = fnAcc;
    },

    getSubAggs: function() {
        return [];
    },

//    getVarsMentioned: function() {
//        var result = this.customAggFactory.getVarsMentioned();
//        return result;
//    },

});

module.exports = AggCustomAgg;
