/* jshint evil: true */
var Class = require('../../ext/class');

var ExprEvaluator = Class.create({
    eval: function() { //expr, binding) {
        throw 'Not overridden';
    },
});

module.exports = ExprEvaluator;