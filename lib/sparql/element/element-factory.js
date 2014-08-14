var Class = require('../../ext/Class');

var ElementFactory = Class.create({
    createElement: function() {
        throw 'Not overridden';
    },
});

module.exports = ElementFactory;
