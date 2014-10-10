var Class = require('../ext/Class');

var Generator = Class.create({
    next: function() {
        throw new Error('Override me');
    },
});

module.exports = Generator;
