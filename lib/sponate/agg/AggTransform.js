var Class = require('../../ext/Class');

var NodeFactory = require('../../rdf/NodeFactory');

var AccTransform = require('../acc/AccTransform');
var Agg = require('./Agg');

var AggTransform = Class.create(Agg, {
    classLabel: 'jassa.sponate.AggTransform',

    initialize: function(subAgg, fn) {
        this.subAgg = subAgg;
        this.fn = fn;
    },

    getSubAggs: function() {
        return [
            this.subAgg,
        ];
    },

    createAcc: function() {
        var result = new AccTransform(this.subAgg, this.fn);
        return result;
    },

    toString: function() {
        return JSON.stringify(this);
    },

});

module.exports = AggTransform;
