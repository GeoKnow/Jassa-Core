var Class = require('../ext/Class');

var Agg = require('./Agg');
var AccArray = require('../acc/AggArray');


var AggArray = Class.create(Agg, {
    classLabel: 'jassa.sponate.AggArray',

    initialize: function(subAgg, fnIndex) {
        this.subAgg = subAgg;
        this.fnIndex = fnIndex;
    },

    createAcc: function() {
        var result = new AccArray(this.subAgg, this.fnIndex);
        return result;
    },

    getSubAgg: function() {
        return this.subAgg;
    },

    getFnIndex: function() {
        return this.fnIndex;
    },

    getSubAggs: function() {
        return [];
    },

    toString: function() {
        return this.expr.toString();
    },


});

module.exports = AggArray;
