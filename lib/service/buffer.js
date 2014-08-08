var Class = require('../ext/class');

var Buffer = Class.create({
    isFull: function() {
        throw 'Not overridden';
    },
});

module.exports = Buffer;