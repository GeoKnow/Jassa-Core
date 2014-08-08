var Class = require('../../ext/class');

var QueryExecution = Class.create({
    execSelect: function() {
        throw 'Not overridden';
    },

    execAsk: function() {
        throw 'Not overridden';
    },

    execDescribeTriples: function() {
        throw 'Not overridden';
    },

    execConstructTriples: function() {
        throw 'Not overridden';
    },

    setTimeout: function() {
        throw 'Not overridden';
    },
});

module.exports = QueryExecution;