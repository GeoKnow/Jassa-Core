var Expr = require('./expr');
var NodeValue = require('./node-value');

var ExprVar = function(v) {
    Expr.call(this);

    this.classLabel = 'ExprVar';

    this.initialize(v);
};
// inherit
ExprVar.prototype = Object.create(Expr.prototype);
// hand back the constructor
ExprVar.prototype.constructor = ExprVar;


ExprVar.prototype.initialize = function(v) {
    this.v = v;
};

ExprVar.prototype.copySubstitute = function(fnNodeMap) {
    var node = fnNodeMap(this.v);

    var result;
    if (node === null) {
        result = this;
    } else if (node.isVariable()) {
        result = new ExprVar(node);
    } else {
        result = NodeValue.makeNode(node);
    }

    //var result = (n == null) ? this : //node;//rdf.NodeValue.makeNode(node); 

    return result;
    //return new ns.ExprVar(this.v.copySubstitute(fnNodeMap));
    //return this;
};

ExprVar.prototype.getArgs = function() {
    return [];
};

ExprVar.prototype.copy = function(args) {
    if (args && args.length > 0) {
        throw 'Invalid argument';
    }

    var result = new ExprVar(this.v);
    return result;
};

ExprVar.prototype.isVar = function() {
    return true;
};

ExprVar.prototype.getExprVar = function() {
    return this;
};

ExprVar.prototype.asVar = function() {
    return this.v;
};

ExprVar.prototype.getVarsMentioned = function() {
    return [this.v];
};

ExprVar.prototype.toString = function() {
    return '' + this.v;
};

module.exports = ExprVar;
