var Class = require('../../ext/Class');

var ElementFactory = Class.create({
    createElement: function() {
        throw new Error('Not overridden');
    },
});

module.exports = ElementFactory;
