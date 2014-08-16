var Class = require('../ext/class');

// constructor
var AnonId = Class.create({
    classLabel: 'AnonId',
    getLabelString: function() {
        throw new Error('not implemented');
    },
});

module.exports = AnonId;
