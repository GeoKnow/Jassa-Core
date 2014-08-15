var Class = require('../ext/Class');

var Iterator = Class.create({
    next: function() {
        throw 'Not overridden';
    },
    hasNext: function() {
        throw 'Not overridden';
    },
});

module.exports = Iterator;
