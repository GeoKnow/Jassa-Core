var forEach = require('lodash.foreach');

var Class = require('../../ext/Class');

var Agg = require('./Agg');
var AccObject = require('../acc/AccObject');

/**
 * An aggregator for a map from *predefined* keys to aggregators.
 */
var AggObject = Class.create(Agg, {
    classLabel: 'jassa.sponate.AggObject',

    initialize: function(attrToAgg) {
        this.attrToAgg = attrToAgg;
    },

    getAttrToAgg: function() {
        return this.attrToAgg;
    },

    createAcc: function() {
        var attrToAcc = {};

        forEach(this.attrToAgg, function(agg, attr) {
            var acc = agg.createAcc();
            attrToAcc[attr] = acc;
        });

        var result = new AccObject(attrToAcc);
        return result;

    },

    getSubAggs: function() {
        var result = [];

        forEach(this.attrToAgg, function(subAgg) {
            result.push(subAgg);
        });

        return result;
    },

    toString: function() {
        var parts = [];
        forEach(this.attrToAgg, function(v, k) {
            parts.push('"' + k + '": ' + v);
        });

        var result = '{' + parts.join(',') + '}';
        return result;
    },

});

module.exports = AggObject;
