var Class = require('../../ext/Class');
var ExprFunctionBase = require('./ExprFunctionBase');

var ExprFunction1 = Class.create(ExprFunctionBase, {
    initialize: function($super, name, subExpr) {
        $super(name);

        this.subExpr = subExpr;
    },

    getArgs: function() {
        return [
            this.subExpr,
        ];
    },

    copy: function(args) {
        if (args.length !== 1) {
            throw 'Invalid argument';
        }

        var result = this.$copy(args);
        return result;
    },

    getSubExpr: function() {
        return this.subExpr;
    },
});

module.exports = ExprFunction1;
