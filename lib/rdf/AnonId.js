var Class = require('../ext/Class');

// constructor
var AnonId = Class.create({
    classLabel: 'AnonId',
    getLabelString: function() {
        throw 'not implemented';
    },
});

module.exports = AnonId;
