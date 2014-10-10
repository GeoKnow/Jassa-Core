var Class = require('../../ext/Class');
var Expr = require('./Expr');
var NodeValueUtils = require('./../NodeValueUtils');

var ExprVar = Class.create(Expr, {
    classLabel: 'ExprVar',

    initialize: function(v) {
        this.v = v;
    },

    eval: function(binding) {
        var node = binding.get(this.v);
        var result = NodeValueUtils.makeNode(node);
        //if(result == null) {
        //    console.log('[WARN] ExprVar ' + this.v + ' evaluated to null');
        //}
        return result;
    },

    copySubstitute: function(fnNodeMap) {
        var node = fnNodeMap(this.v);

        var result;
        if (node == null) {
            result = this;
        } else if (node.isVariable()) {
            result = new ExprVar(node);
        } else {
            result = NodeValueUtils.makeNode(node);
        }

        // var result = (n == null) ? this : //node;//rdf.NodeValue.makeNode(node);

        return result;
        // return new ns.ExprVar(this.v.copySubstitute(fnNodeMap));
        // return this;
    },

    getArgs: function() {
        return [];
    },

    copy: function(args) {
        if (args && args.length > 0) {
            throw new Error('Invalid argument');
        }

        var result = new ExprVar(this.v);
        return result;
    },

    isVar: function() {
        return true;
    },

    getExprVar: function() {
        return this;
    },

    asVar: function() {
        return this.v;
    },

    getVarsMentioned: function() {
        return [
            this.v,
        ];
    },

    toString: function() {
        return this.v.toString();
    },
});

module.exports = ExprVar;
