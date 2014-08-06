var NodeValue = require('./node-value');
var ExprEvaluator = require('./expr-evaluator');

var ExprEvaluatorImpl = function() {
    ExprEvaluator.call(this);
};
ExprEvaluatorImpl.prototype = Object.create(ExprEvaluator.prototype);
ExprEvaluatorImpl.prototype.constructor = ExprEvaluatorImpl;

ExprEvaluatorImpl.prototype.eval = function(expr, binding) {
    var result, e;

    if (expr.isVar()) {
        e = expr.getExprVar();
        result = this.evalExprVar(e, binding);
    } else if (expr.isFunction()) {
        e = expr.getFunction();
        result = this.evalExprFunction(e, binding);
    } else if (expr.isConstant()) {
        e = expr.getConstant();
        // FIXME: this.evalConstant not defined
        result = this.evalConstant(e, binding);
    } else {
        throw 'Unsupported expr type';
    }

    return result;
};


ExprEvaluatorImpl.prototype.evalExprVar = function(expr, binding) {
    //console.log('Expr' + JSON.stringify(expr));
    var v = expr.asVar();

    var node = binding.get(v);

    var result;
    if (node === null) {
        //console.log('No Binding for variable "' + v + '" in ' + expr + ' with binding ' + binding);
        //throw 'Bailing out';
        return NodeValue.nvNothing;
        //return null;
    } else {
        result = NodeValue.makeNode(node);
    }

    return result;
};

ExprEvaluatorImpl.prototype.evalExprFunction = function() { //expr, binding) {        
};

ExprEvaluatorImpl.prototype.evalNodeValue = function() { //expr, binding) {
};

module.exports = ExprEvaluatorImpl;