var Class = require('../ext/Class');

// constructor
var AnonId = Class.create({
    classLabel: 'AnonId',
    getLabelString: function() {
        throw new Error('not implemented');
    },
});

module.exports = AnonId;
