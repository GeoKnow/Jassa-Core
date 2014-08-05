var andify = require('./andify');
var Element = require('./element');

var ElementFilter = function(expr) {
    Element.call(this);

    this.classLabel = 'jassa.sparql.ElementFilter';

    // init
    this.initialize(expr);
};
// inherit
ElementFilter.prototype = Object.create(Element.prototype);
// hand back the constructor
ElementFilter.prototype.constructor = ElementFilter;

// functions
ElementFilter.prototype.initialize = function(expr) {
    if (Array.isArray(expr)) {
        console.log('[WARN] Array argument for filter is deprecated');
        expr = andify(expr);
    }

    this.expr = expr;
};

ElementFilter.prototype.getArgs = function() {
    return [];
};

ElementFilter.prototype.copy = function(args) {
    if (args.length !== 0) {
        throw 'Invalid argument';
    }

    //  FIXME: Should we clone the attributes too?
    var result = new ElementFilter(this.expr);
    return result;
};

ElementFilter.prototype.copySubstitute = function(fnNodeMap) {
    var newExpr = this.expr.copySubstitute(fnNodeMap);
    return new ElementFilter(newExpr);
};

ElementFilter.prototype.getVarsMentioned = function() {
    return this.expr.getVarsMentioned();
};

ElementFilter.prototype.flatten = function() {
    return this;
};

ElementFilter.prototype.toString = function() {

    //var expr = ns.andify(this.exprs);

    return 'Filter(' + this.expr + ')';
};

module.exports = ElementFilter;
