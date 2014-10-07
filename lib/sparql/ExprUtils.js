var ExprVar = require('./expr/ExprVar');
var NodeValue = require('./expr/NodeValue');
var NodeValueUtils = require('./NodeValueUtils');
var E_Equals = require('./expr/E_Equals');

var E_LogicalAnd = require('./expr/E_LogicalAnd');
var E_LogicalOr = require('./expr/E_LogicalOr');

var ExprUtils = {

    copySubstitute: function(expr, binding) {
        var fn = function(node) {

            var result = null;

            if (node.isVar()) {
                // var varName = node.getName();
                // var subst = binding.get(varName);
                var subst = binding.get(node);

                if (subst != null) {
                    result = subst;
                }
            }

            if (result == null) {
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
        if (vars == null) {
            vars = binding.getVars();
        }

        var result = [];
        vars.forEach(function(v) {
            var exprVar = new ExprVar(v);
            var node = binding.get(v);

            // TODO What if node is NULL
            var nodeValue = NodeValueUtils.makeNode(node);

            var expr = new E_Equals(exprVar, nodeValue);

            result.push(expr);
        });

        return result;
    },

    opify: function(exprs, fnCtor) {
        var open = exprs;
        var next = [];

        while (open.length > 1) {

            for (var i = 0; i < open.length; i += 2) {

                var a = open[i];

                if (i + 1 === open.length) {
                    next.push(a);
                    break;
                }

                var b = open[i + 1];

                var newExpr = fnCtor(a, b);

                next.push(newExpr); // ;new ns.E_LogicalOr(a, b));
            }

            open = next;
            next = [];
        }

        return open[0];
    },

    andify: function(exprs) {
        var result = this.opify(exprs, function(a, b) {
            return new E_LogicalAnd(a, b);
        });

        return result;
    },

    orify: function(exprs) {
        var result = this.opify(exprs, function(a, b) {
            return new E_LogicalOr(a, b);
        });

        return result;
    },

};

module.exports = ExprUtils;
