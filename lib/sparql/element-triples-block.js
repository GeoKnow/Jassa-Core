// libs
var union = require('lodash.union');

// project deps
var uniqTriples = require('./uniq-triples');
var Element = require('./element');

var ElementTriplesBlock = function(triples) {
    Element.call(this);

    this.classLabel = 'jassa.sparql.ElementTriplesBlock';

    // init
    this.initialize(triples);
};
// inherit
ElementTriplesBlock.prototype = Object.create(Element.prototype);
// hand back the constructor
ElementTriplesBlock.prototype.constructor = ElementTriplesBlock;


ElementTriplesBlock.prototype.initialize = function(triples) {
    this.triples = triples ? triples : [];
};

ElementTriplesBlock.prototype.getArgs = function() {
    return [];
};

ElementTriplesBlock.prototype.copy = function(args) {
    if (args.length !== 0) {
        throw 'Invalid argument';
    }

    var result = new ElementTriplesBlock(this.triples);
    return result;
};

ElementTriplesBlock.prototype.getTriples = function() {
    return this.triples;
};

ElementTriplesBlock.prototype.addTriples = function(otherTriples) {
    this.triples = this.triples.concat(otherTriples);
};

ElementTriplesBlock.prototype.uniq = function() {
    this.triples = uniqTriples(this.triples);
    //this.triples = _.uniq(this.triples, false, function(x) { return x.toString(); });
};

ElementTriplesBlock.prototype.copySubstitute = function(fnNodeMap) {
    var newElements = this.triples.map(function(x) {
        return x.copySubstitute(fnNodeMap);
    });
    return new ElementTriplesBlock(newElements);
};

ElementTriplesBlock.prototype.getVarsMentioned = function() {
    var result = [];
    this.triples.forEach(function(triple) {
        result = union(result, triple.getVarsMentioned());
    });

    return result;
};

ElementTriplesBlock.prototype.flatten = function() {
    return this;
};

ElementTriplesBlock.prototype.toString = function() {
    return this.triples.join(' . ');
};

module.exports = ElementTriplesBlock;
