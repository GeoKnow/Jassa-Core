var Class = require('../ext/Class');

var AggBase = require('./AggBase');
var AccObject = require('../acc/AccObject');

/**
 * An aggregator for a map from *predefined* keys to aggregators.
 */
var AggObject = Class.create(AggBase, {
    classLabel: 'jassa.sponate.AggObject',

    initialize: function(attrToAggr) {
        this.attrToAggr = attrToAggr;
    },

    getMembers: function() {
        return this.attrToAggr;
    },

    createAcc: function() {
        var attrToAcc = {};

        this.attrToAggr.forEach(function(aggr, attr) {
            var acc = aggr.createAcc();
            attrToAcc[attr] = acc;
        });

        var result = new AccObject(attrToAcc);
        return result;

    },

    getSubAggs: function() {
        var result = [];

        this.attrToAggr.forEach(function(member) {
            result.push(member);
        });

        return result;
    },

    toString: function() {
        var parts = [];
        this.attrToPattern.forEach(function(v, k) {
            parts.push('"' + k + '": ' + v);
        });

        var result = '{' + parts.join(',') + '}';
        return result;
    },

});

module.exports = AggObject;
