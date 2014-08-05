var Element = require('./element');

var ElementOptional = function(element) {
    Element.call(this);

    this.classLabel = 'jassa.sparql.ElementOptional';

    // init
    this.initialize(element);
};
// inherit
ElementOptional.prototype = Object.create(Element.prototype);
// hand back the constructor
ElementOptional.prototype.constructor = ElementOptional;



ElementOptional.prototype.initialize = function(element) {
    this.optionalPart = element;
};

ElementOptional.prototype.getArgs = function() {
    return [this.optionalPart];
};

ElementOptional.prototype.copy = function(args) {
    if (args.length !== 1) {
        throw 'Invalid argument';
    }

    // FIXME: Should we clone the attributes too?
    var result = new ElementOptional(this.expr);
    return result;
};

ElementOptional.prototype.getVarsMentioned = function() {
    return this.optionalPart.getVarsMentioned();
};

ElementOptional.prototype.copySubstitute = function(fnNodeMap) {
    return new ElementOptional(this.optionalPart.copySubstitute(fnNodeMap));
};

ElementOptional.prototype.flatten = function() {
    return new ElementOptional(this.optionalPart.flatten());
};

ElementOptional.prototype.toString = function() {
    return 'Optional {' + this.optionalPart + '}';
};

module.exports = ElementOptional;
