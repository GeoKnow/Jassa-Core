var Class = require('../../ext/Class');

var BindingMapperIndex = require('../binding_mapper/BindingMapperIndex');
var Acc = require('./Acc');

var AccFn = Class.create(Acc, {
    classLabel: 'jassa.sponate.AccFn',

    initialize: function(subAgg, indexBindingMapper) {
        var self = this;

        this.i = 0;

        this.subAgg = subAgg;
        this.indexBindingMapper = indexBindingMapper || new BindingMapperIndex();

        this.subAccs = [];
    },

    accumulate: function(binding) {
        var index = this.indexBindingMapper.map(binding, this.i++);

        // If the index is null, we skip accumulation of the binding
        if(index != null) {
            var subAcc = this.subAccs[index];
            if(!subAcc) {
                subAcc = this.subAgg.createAcc();
                this.subAccs[index] = subAcc;
            }

            subAcc.accumulate(binding);
        }
    },

    getValue: function() {
        var result = [];

        this.subAccs.forEach(function(acc, i) {
           var v = acc.getValue();
           if(v != null) {
               result[i] = v;
           }
        });

        return result;
    },

    getSubAccs: function() {
        var result = [];
        this.subAccs.forEach(function(acc) {
            if(acc) {
                result.push(acc);
            }
        });

        return result;
    },

});

module.exports = AccFn;
