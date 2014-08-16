// libs
var union = require('lodash.union');
var Class = require('../../ext/Class');

// project deps
var ElementUtils = require('../ElementUtils');
var Element = require('./Element');

var ElementTriplesBlock = Class.create(Element, {
    classLabel: 'jassa.sparql.ElementTriplesBlock',
    initialize: function(triples) {
        this.triples = triples ? triples : [];
    },

    getArgs: function() {
        return [];
    },

    copy: function(args) {
        if (args.length !== 0) {
            throw 'Invalid argument';
        }

        var result = new ElementTriplesBlock(this.triples);
        return result;
    },

    getTriples: function() {
        return this.triples;
    },

    addTriples: function(otherTriples) {
        this.triples = this.triples.concat(otherTriples);
    },

    uniq: function() {
        this.triples = ElementUtils.uniqTriples(this.triples);
        // this.triples = _.uniq(this.triples, false, function(x) { return x.toString(); });
    },

    copySubstitute: function(fnNodeMap) {
        var newElements = this.triples.map(function(x) {
            return x.copySubstitute(fnNodeMap);
        });
        return new ElementTriplesBlock(newElements);
    },

    getVarsMentioned: function() {
        var result = [];
        this.triples.forEach(function(triple) {
            result = union(result, triple.getVarsMentioned());
        });

        return result;
    },

    flatten: function() {
        return this;
    },

    toString: function() {
        return this.triples.join(' . ');
    },
});

module.exports = ElementTriplesBlock;
