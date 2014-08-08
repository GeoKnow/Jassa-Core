var Class = require('../../ext/class');
var ExprFunctionBase = require('../expr/expr-function-base');

var ExprFunctionN = Class.create(ExprFunctionBase, {
    initialize: function($super, name, args) {
        $super(name, args);

        this.args = args;
    },

    getArgs: function() {
        return this.args;
    },
});

module.exports = ExprFunctionN;