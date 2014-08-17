var Class = require('../ext/Class');

var NodeFactory = require('../../rdf/NodeFactory');

var AccRef = require('../acc/AccRef');
var Agg = require('./Agg');

var AggRef = Class.create(Agg, {
    classLabel: 'jassa.sponate.AggRef',

    /**
     * The subAgg aggregates the IDs of the objects to be referenced
     */
    initialize: function(subAgg, refSpec) {
        this.subAgg = subAgg;
        this.refSpec = refSpec;
    },

    getRefSpec: function() {
        return this.refSpec;
    },

    getSubAggs: function() {
        return [];
    },

    createAcc: function() {
        var result = new AccRef(this.subAgg, this.refSpec);
        return result;
    },

    toString: function() {
        return JSON.stringify(this);
    },

});

module.exports = AggRef;
