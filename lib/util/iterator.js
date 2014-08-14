var Class = require('../ext/Class');

var IteratorObj = Class.create({
    next: function() {
        throw 'Not overridden';
    },
    hasNext: function() {
        throw 'Not overridden';
    },
});

module.exports = IteratorObj;
