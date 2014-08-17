var Class = require('../../ext/Class');

var HashMap = require('../../util/collection/HashMap');

var Acc = require('./Acc');

var AccMap = Class.create(Acc, {
    classLabel: 'jassa.sponate.AccMap',

    initialize: function(fnBinding, subAgg) {
        this.fnBinding = fnBinding;
        this.subAgg = subAgg;

        this.state = new HashMap();
    },

    accumulate: function(binding) {
        var k = this.fnBinding(binding);

        var subAcc = this.state.get(k);
        if(!subAcc) {
            subAcc = this.subAgg.createAcc();
            this.state.put(k, subAcc);
        }
        
        subAcc.accumulate(binding);
    },

    getValue: function() {
        var result = new HashMap();

        var entries = this.state.entries();
        entries.forEach(function(acc, k) {
            var v = acc.getValue();
            result.put(k, v);
        });

        return result;
    },

    getSubAccs: function() {
        var result = [];

        var entries = this.state.entries();
        entries.forEach(function(acc, k) {
            result.push(acc);
        });

        return result;
    },

});

module.exports = AccMap;
