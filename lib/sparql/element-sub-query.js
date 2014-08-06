var Element = require('./element');

var ElementSubQuery = function(expr) {
    Element.call(this);

    this.classLabel = 'jassa.sparql.ElementSubQuery';

    // init
    this.initialize(expr);
};
// inherit
ElementSubQuery.prototype = Object.create(Element.prototype);
// hand back the constructor
ElementSubQuery.prototype.constructor = ElementSubQuery;


ElementSubQuery.prototype.initialize = function(query) {
    this.query = query;
};

ElementSubQuery.prototype.getArgs = function() {
    return [];
};

ElementSubQuery.prototype.copy = function(args) {
    if (args.length !== 0) {
        throw 'Invalid argument';
    }

    // FIXME: Should we clone the attributes too?
    var result = new ElementSubQuery(this.query);
    return result;
};

ElementSubQuery.prototype.toString = function() {
    return '{ ' + this.query + ' }';
};

ElementSubQuery.prototype.copySubstitute = function(fnNodeMap) {
    return new ElementSubQuery(this.query.copySubstitute(fnNodeMap));
};

ElementSubQuery.prototype.flatten = function() {
    return new ElementSubQuery(this.query.flatten());
};

ElementSubQuery.prototype.getVarsMentioned = function() {
    return this.query.getVarsMentioned();
};

module.exports = ElementSubQuery;
