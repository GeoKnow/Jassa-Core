var Class = require('../ext/class');

var ElementFactory = Class.create({
    createElement: function() {
        throw 'Not overridden';
    },
});

module.exports = ElementFactory;