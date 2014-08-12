var Class = require('../ext/class');

var Generator = Class.create({
    next: function() {
        throw 'Override me';
    },
});

module.exports = Generator;
