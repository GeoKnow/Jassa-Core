var Class = require('../ext/Class');

var MapList = require('./../MapList');

var Acc = require('./Acc');

// TODO Is this class even still in use???
var AccMap = Class.create(Acc, {
    classLabel: 'jassa.sponate.AccMap',

    initialize: function(aggregatorMap) {
        this.aggregatorMap = aggregatorMap;

        this.keyToAggr = new MapList();
    },

    getPattern: function() {
        return this.aggregatorMap;
    },

    process: function(binding, context) {
        var aggregator = this.aggregatorMap;

        var keyExpr = aggregator.getKeyExpr();
        var subPattern = aggregator.getSubPattern();
        // var isArray = aggregator.isArray();

        var exprEvaluator = context.exprEvaluator;
        var aggregatorFactory = context.aggregatorFactory;

        var keyEx = exprEvaluator.eval(keyExpr, binding); // jshint:evil false

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

        var isArray = this.aggregatorMap.isArray();
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

    getJsonMap: function() { // retainRdfNodes
        var result = {};

        // var keyToIndex = this.keyToAggr.getKeyToIndex();

        // keyToIndex.forEach(function(index, aggr) {
            // throw 'Should not come here?';
            // FIXME: items not defined
            // var aggr = items[index];
            // var data = aggr.getJson(retainRdfNodes);
            // FIXME: key not defined
            // result[key] = data;
        // });

        return result;
    },

});

module.exports = AccMap;
