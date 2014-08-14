var Class = require('../ext/Class');

var Generator = Class.create({
    next: function() {
        throw 'Override me';
    },
});

module.exports = Generator;
