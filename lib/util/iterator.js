var Class = require('../ext/class');

var IteratorObj = Class.create({
    next: function() {
        throw 'Not overridden';
    },
    hasNext: function() {
        throw 'Not overridden';
    },
});

module.exports = IteratorObj;
