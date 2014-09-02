var Class = require('../../ext/Class');

var HashMap = require('../../util/collection/HashMap');

var Acc = require('./Acc');

var AccMap = Class.create(Acc, {
    classLabel: 'jassa.sponate.AccMap',

    initialize: function(keyBindingMapper, subAgg) {
        this.keyBindingMapper = keyBindingMapper;
        this.subAgg = subAgg;

        this.state = new HashMap();
    },

    getState: function() {
        return this.state;
    },

    accumulate: function(binding) {
        var k = this.keyBindingMapper.map(binding, 0);

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
        entries.forEach(function(item) {
            var k = item.key;
            var acc = item.val;

            var v = acc.getValue();
            result.put(k, v);
        });

        return result;
    },

    getSubAccs: function() {
        var result = [];

        var entries = this.state.entries();
        entries.forEach(function(entry) {
            result.push(entry.val);
        });

        return result;
    },

});

module.exports = AccMap;
