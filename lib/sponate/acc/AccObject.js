var Class = require('../../ext/Class');

var Acc = require('./Acc');

var AccObject = Class.create(Acc, {
    classLabel: 'jassa.sponate.AccObject',

    /**
     * An aggregator factory must have already taken
     * care of initializing the attrToAggr map.
     *
     */
    initialize: function(attrToAcc) {
        this.attrToAcc = attrToAcc;
    },

    accumulate: function(binding) {
        this.attrToAggr.forEach(function(acc) {
            acc.accumulate(binding);
        });
    },

    getValue: function() {
        var result = {};

        this.attrToAcc.forEach(function(acc, attr) {
            var v = acc.getValue();
            result[attr] = acc;
        });

        return result;
    },
    
    getSubAccs: function() {
        var result = [];

        this.attrToAcc.forEach(function(acc, attr) {
            result.push(acc);
        });
        
        return result;
    },

});

module.exports = AccObject;
