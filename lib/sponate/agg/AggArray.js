var Class = require('../../ext/Class');

var Agg = require('./Agg');
var AccArray = require('../acc/AccArray');


var AggArray = Class.create(Agg, {
    classLabel: 'jassa.sponate.AggArray',

    initialize: function(subAgg, indexBindingMapper) {
        this.subAgg = subAgg;
        this.indexBindingMapper = indexBindingMapper;
    },

    createAcc: function() {
        var result = new AccArray(this.subAgg, this.indexBindingMapper);
        return result;
    },

    getSubAgg: function() {
        return this.subAgg;
    },

    getSubAggs: function() {
        return [
            this.subAgg,
        ];
    },

    toString: function() {
        return this.expr.toString();
    },

});

module.exports = AggArray;
