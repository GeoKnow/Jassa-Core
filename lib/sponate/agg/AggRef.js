var Class = require('../../ext/Class');

var NodeFactory = require('../../rdf/NodeFactory');

var AccRef = require('../acc/AccRef');
var Agg = require('./Agg');

var AggRef = Class.create(Agg, {
    classLabel: 'jassa.sponate.AggRef',

    /**
     * The subAgg aggregates the IDs of the objects to be referenced
     */
    initialize: function(bindingMapper, refSpec) {
        this.bindingMapper = bindingMapper;
        this.refSpec = refSpec;
    },

    clone: function() {
        var result = new AggRef(this.bindingMapper, this.refSpec);
        return result;
    },

    getBindingMapper: function() {
        return this.bindingMapper;
    },

    setBindingMapper: function(bindingMapper) {
        this.bindingMapper = bindingMapper;
    },

    getRefSpec: function() {
        return this.refSpec;
    },

    setRefSpec: function(refSpec) {
        this.refSpec = refSpec;
    },

    getSubAggs: function() {
        return [];
    },

    createAcc: function() {
        var result = new AccRef(this.bindingMapper, this.refSpec);
        return result;
    },

    toString: function() {
        return JSON.stringify(this);
    },

});

module.exports = AggRef;
