var Element = require('./element');
var ElementTriplesBlock = require('./element-triples-block');
var ElementUtils = require('./element-utils');
var PatternUtils = require('./pattern-utils');
var joinElements = require('./join-elements');

var ElementGroup = function(elements) {
    Element.call(this);

    this.classLabel = 'jassa.sparql.ElementGroup';

    // init
    this.initialize(elements);
};
// inherit
ElementGroup.prototype = Object.create(Element.prototype);
// hand back the constructor
ElementGroup.prototype.constructor = ElementGroup;



ElementGroup.prototype.initialize = function(elements) {
    this.elements = elements ? elements : [];
};

ElementGroup.prototype.addElement = function(element) {
    this.elements.push(element);
};

ElementGroup.prototype.getArgs = function() {
    return this.elements;
};

ElementGroup.prototype.copy = function(args) {
    var result = new ElementTriplesBlock(args);
    return result;
};

ElementGroup.prototype.copySubstitute = function(fnNodeMap) {
    var newElements = this.elements.map(function(x) {
        return x.copySubstitute(fnNodeMap);
    });
    return new ElementGroup(newElements);
};

ElementGroup.prototype.getVarsMentioned = function() {
    var result = PatternUtils.getVarsMentioned(this.elements);
    return result;
};

ElementGroup.prototype.toString = function() {
    //return this.elements.join(" . ");
    return joinElements(' . ', this.elements);
};


ElementGroup.prototype.flatten = function() {
    var processed = ElementUtils.flatten(this.elements);

    if (processed.length === 1) {
        return processed[0];
    } else {
        return new ElementGroup(ElementUtils.flattenElements(processed));
    }
};

module.exports = ElementGroup;
