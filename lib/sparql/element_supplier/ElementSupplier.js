var Class = require('../../ext/Class');

var ElementSupplier = Class.create({
    getElement: function() {
        throw new Error('Not overridden');
    },
});

module.exports = ElementSupplier;
