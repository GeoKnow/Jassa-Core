var Class = require('../../ext/Class');

var Iterator = Class.create({
    next: function() {
        throw new Error('Not overridden');
    },
    hasNext: function() {
        throw new Error('Not overridden');
    }
});

module.exports = Iterator;
