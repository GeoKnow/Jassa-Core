var Class = require('../ext/class');

var AggregatorBase = require('./AggregatorBase');
var AccumulatorObject = require('../accumulators/AccumulatorObject');

/**
 * An aggregator for a map from *predefined* keys to aggregators.
 */
var AggregatorObject = Class.create(AggregatorBase, {
    classLabel: 'jassa.sponate.AggregatorObject',

    initialize: function(attrToAggr) {
        this.attrToAggr = attrToAggr;
    },

    getClassName: function() {
        return 'jassa.sponate.AggregatorObject';
    },

    getMembers: function() {
        return this.attrToAggr;
    },

    createAccumulator: function() {
        var attrToAcc = {};

        var self = this;

        _(this.attrToAggr).each(function(aggr, attr) {
            var acc = aggr.createAccumulator();
            attrToAcc[attr] = acc;
        });

        // console.log('attrToAggr ', attrToAggr);
        var result = new AccumulatorObject(this, accToAggr);
        return result;

    },

    getAggregator: function(attr) {
        return this.attrToAggr[attr];
    },

    toString: function() {
        var parts = [];
        _(this.attrToPattern).each(function(v, k) {
            parts.push('"' + k + '": ' + v);
        });

        var result = '{' + parts.join(',') + '}';
        return result;
    },

    getVarsMentioned: function() {
        var result = [];

        var fnToString = (function(x) {
            // console.log('x: ' + x, x, x.toString());
            return x.toString();
        });

        _(this.attrToPattern).each(function(member, k) {
            var vs = member.getVarsMentioned();

            if (!vs) {
                console.log('[ERROR] Could not retrieve vars for member of aggregator', this, member);
            } else {
                result = result.concat(vs);
            }
        });
        result = _(result).uniq(false, fnToString);

        return result;
    },

    $findPattern: function(attrPath, start) {
        var attr = attrPath.at(start);

        var aggr = this.attrToAggr[attr];

        var result;
        if (aggr) {
//              if(attrPath.size() > start + 1) {
            result = aggr.findAggregator(attrPath, start + 1);
//              }
//              else {
//                  result = pattern;
//              }
        } else {
            result = null;
        }

        return result;
    },

    getSubAggregators: function() {
        var result = [];

        _(this.attrToAggr).each(function(member, k) {
            result.push(member);
        });

        return result;
    },
});

module.exports = AggregatorObject;
