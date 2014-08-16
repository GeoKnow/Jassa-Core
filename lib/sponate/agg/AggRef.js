var Class = require('../ext/Class');

var NodeFactory = require('../../rdf/NodeFactory');

var Agg = require('./Agg');

/**
 * A PatternRef represents a reference to another Mapping.
 * However, because we allow forward references, we might not be able
 * to resolve references during parsing.
 * For this reason, we first just store the original configuration
 * in the stub object, and later resolve it into a full blown refSpec.
 */
var AggRef = Class.create(Agg, {
    classLabel: 'jassa.sponate.AggRef',

    initialize: function(stub) {
        this.stub = stub;
        this.refSpec = null;
    },

    getClassName: function() {
        return 'jassa.sponate.AggRef';
    },

    getStub: function() {
        return this.stub;
    },

    setRefSpec: function(refSpec) {
        this.refSpec = refSpec;
    },

    getRefSpec: function() {
        return this.refSpec;
    },

    toString: function() {
        return JSON.stringify(this);
    },

    getVarsMentioned: function() {
        var result = [];

        var stub = this.stub;
  // FIXME: joinColumn not defined
        if (stub.joinColumn != null) {
            // TODO HACK Use proper expression parsing here
            var varName = stub.joinColumn.substr(1);
            var v = NodeFactory.createVar(varName);
            result.push(v);
        } else {
            console.log('[ERROR] No join column declared; cannot get variable');
            throw 'Bailing out';
        }

        return result;
    },

    getSubAggs: function() {
        return [];
    },
});

module.exports = AggRef;
