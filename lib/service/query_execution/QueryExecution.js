var Class = require('../../ext/Class');

var QueryExecution = Class.create({
    execSelect: function() {
        throw new Error('Not overridden');
    },

    execAsk: function() {
        throw new Error('Not overridden');
    },

    execDescribeTriples: function() {
        throw new Error('Not overridden');
    },

    execConstructTriples: function() {
        throw new Error('Not overridden');
    },

    setTimeout: function() {
        throw new Error('Not overridden');
    },
});

module.exports = QueryExecution;
