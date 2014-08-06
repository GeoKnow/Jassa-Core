var SparqlString = require('./sparql-string');
var Expr = require('./expr');

var ExprString = function(sparqlString) {
    Expr.call(this);

    this.classLabel = 'jassa.sparql.ExprString';

    this.initialize(sparqlString);
};
// inherit
ExprString.prototype = Object.create(Expr.prototype);
// hand back the constructor
ExprString.prototype.constructor = ExprString;

ExprString.prototype.initialize = function(sparqlString) {
    this.sparqlString = sparqlString;
};

ExprString.prototype.copySubstitute = function(fnNodeMap) {
    var newSparqlString = this.sparqlString.copySubstitute(fnNodeMap);
    return new ExprString(newSparqlString);
};

ExprString.prototype.getVarsMentioned = function() {
    return this.sparqlString.getVarsMentioned();
};

ExprString.prototype.getArgs = function() {
    return [];
};

ExprString.prototype.copy = function(args) {
    if (args.length !== 0) {
        throw 'Invalid argument';
    }

    return this;
};

ExprString.prototype.toString = function() {
    return '(!' + this.expr + ')';
};

ExprString.create = function(str, varNames) {
    var result = new ExprString(SparqlString.create(str, varNames));
    return result;
};

module.exports = ExprString;