var Class = require('../../ext/class');
var Expr = require('./expr');
var NodeValue = require('../node-value');

var ExprVar = Class.create(Expr, {
    classLabel: 'ExprVar',

    initialize: function(v) {
        this.v = v;
    },

    copySubstitute: function(fnNodeMap) {
        var node = fnNodeMap(this.v);

        var result;
        if (node === null) {
            result = this;
        } else if (node.isVariable()) {
            result = new ExprVar(node);
        } else {
            result = NodeValue.makeNode(node);
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
            throw 'Invalid argument';
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
