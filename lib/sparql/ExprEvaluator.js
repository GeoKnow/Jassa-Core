/* jshint evil: true */
var Class = require('../ext/Class');

var ExprEvaluator = Class.create({
    eval: function() { // expr, binding) {
        throw 'Not overridden';
    },
});

module.exports = ExprEvaluator;
