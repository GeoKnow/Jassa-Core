var Class = require('../ext/class');

var Accumulator = require('./Accumulator');

AccumulatorMap = Class.create(Accumulator, {
    classLabel: 'AccumulatorMap',

    initialize: function(aggregatorMap) {
        this.aggregatorMap = aggregatorMap;

        this.keyToAggr = new ns.MapList();
    },

    getPattern: function() {
        return this.patternMap
    },

    process: function(binding, context) {
        var pattern = this.patternMap;

        var keyExpr = pattern.getKeyExpr();
        var subPattern = pattern.getSubPattern();
        var isArray = pattern.isArray();

        var exprEvaluator = context.exprEvaluator;
        var aggregatorFactory = context.aggregatorFactory;

        var keyEx = exprEvaluator.eval(keyExpr, binding);

        if (!keyEx.isConstant()) {
            console.log('[ERROR] Could not evaluate key to a constant ' + JSON.stringify(keyEx) + ' with binding ' + binding);
            throw 'Bailing out';
        }

        var key = keyEx.getConstant().asNode();

        var keyStr = key.toString();

        var aggr = this.keyToAggr.get(keyStr);

        if (aggr == null) {
            aggr = aggregatorFactory.create(subPattern);

            this.keyToAggr.put(keyStr, aggr);
        }

        aggr.process(binding, context);
    },

    getJson: function(retainRdfNodes) {
        var result;

        var isArray = this.patternMap.isArray();
        if (isArray) {
            result = this.getJsonArray(retainRdfNodes);
        } else {
            result = this.getJsonMap(retainRdfNodes);
        }

        return result;
    },

    getJsonArray: function(retainRdfNodes) {
        var aggrs = this.keyToAggr.getItems();
        var result = aggrs.map(function(aggr) {
            var data = aggr.getJson(retainRdfNodes);
            return data;
        });

        return result;
    },

    getJsonMap: function(retainRdfNodes) {
        var result = {};

        var aggrs = this.keyToAggr.getItems();
        var keyToIndex = this.keyToAggr.getKeyToIndex();

        _(keyToIndex).each(function(index, aggr) {
            // FIXME: items not defined
            var aggr = items[index];
            var data = aggr.getJson(retainRdfNodes);
            // FIXME: key not defined
            result[key] = data;
        });

        return result;
    },

});

module.exports = AggregatorMap;
