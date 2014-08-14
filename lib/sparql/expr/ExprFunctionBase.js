var Class = require('../../ext/Class');
var PatternUtils = require('../pattern-utils');
var ExprFunction = require('../expr/expr-function');

var ExprFunctionBase = Class.create(ExprFunction, {
    initialize: function(name) {
        this.name = name;
    },

    copySubstitute: function(fnNodeMap) {
        var args = this.getArgs();
        var newArgs = args.map(function(arg) {
            var r = arg.copySubstitute(fnNodeMap);
            return r;
        });

        var result = this.copy(newArgs);
        return result;
    },

    getVarsMentioned: function() {
        var result = PatternUtils.getVarsMentioned(this.getArgs());
        return result;
    },

    toString: function() {
        var result = this.name + '(' + this.getArgs().join(', ') + ')';
        return result;
    },
});

module.exports = ExprFunctionBase;
