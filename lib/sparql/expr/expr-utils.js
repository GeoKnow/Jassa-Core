var ExprVar = require('./expr-var');
var NodeValue = require('../node-value');
var E_Equals = require('../e/e-equals');

var ExprUtils = {
    copySubstitute: function(expr, binding) {
        var fn = function(node) {

            var result = null;

            if (node.isVar()) {
                //var varName = node.getName();
                //var subst = binding.get(varName);
                var subst = binding.get(node);

                if (subst !== null) {
                    result = subst;
                }
            }

            if (result === null) {
                result = node;
            }

            return result;
        };

        var result = expr.copySubstitute(fn);
        return result;
    },

    /**
     *
     * If varNames is omitted, all vars of the binding are used
     */
    bindingToExprs: function(binding, vars) {
        if (vars === null) {
            vars = binding.getVars();
        }

        var result = [];
        vars.forEach(function(v) {
            var exprVar = new ExprVar(v);
            var node = binding.get(v);

            // TODO What if node is NULL
            var nodeValue = NodeValue.makeNode(node);

            var expr = new E_Equals(exprVar, nodeValue);

            result.push(expr);
        });

        return result;
    },
};

module.exports = ExprUtils;
