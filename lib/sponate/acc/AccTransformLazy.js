var Class = require('../../ext/Class');

var Acc = require('./Acc');

var AccTransformLazy = Class.create(Acc, {
    classLabel: 'jassa.sponate.AccTransformLazy',

    initialize: function(subAcc, fn) {
        this.subAcc = subAcc;
        this.fn = fn;
    },

    getSubAcc: function() {
        return this.subAcc;
    },

    accumulate: function(binding) {
        this.subAcc.accumulate(binding);
    },

    getValue: function() {
        var result = {
            _lazy: {
                value: this.subAcc.getValue(),
                fn: this.fn
            }
        };

        return result;
    },

    getSubAccs: function() {
        return [this.subAcc];
    }
});

module.exports = AccTransformLazy;
