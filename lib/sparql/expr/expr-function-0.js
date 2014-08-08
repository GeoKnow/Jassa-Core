var Class = require('../../ext/class');
var ExprFunctionBase = require('../expr/expr-function-base');

var ExprFunction0 = Class.create(ExprFunctionBase, {
    initialize: function($super, name) {
        $super(name);
    },
    getArgs: function() {
        return [];
    },

    copy: function(args) {
        if (args && args.length > 0) {
            throw 'Invalid argument';
        }

        var result = this.$copy(args);
        return result;
    },
});

module.exports = ExprFunction0;