var Class = require('../../ext/Class');
var ExprFunctionBase = require('./ExprFunctionBase');

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
