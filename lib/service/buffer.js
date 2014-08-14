var Class = require('../ext/Class');

var Buffer = Class.create({
    isFull: function() {
        throw 'Not overridden';
    },
});

module.exports = Buffer;
