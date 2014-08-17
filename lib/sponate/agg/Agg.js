var Class = require('../../ext/Class');

var Agg = Class.create({
    classLabel: 'jassa.sponate.Agg',

    createAcc: function() {
        throw new Error('override me');
    },

    getSubAggs: function() {
        throw new Error('override me');
    },

});

module.exports = Agg;
