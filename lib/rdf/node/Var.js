var Class = require('../../ext/Class');
var Node_Variable = require('./Node_Variable');

var ObjectUtils = require('../../util/ObjectUtils');


var Var = Class.create(Node_Variable, {
    classLabel: 'Var',
    initialize: function(name) {
        this.name = name;
    },
    getName: function() {
        return this.name;
    },
    toString: function() {
        return '?' + this.name;
    },

    hashCode: function() {
        if(this.hash == null) {
            this.hash = ObjectUtils.hashCodeStr(this.name);
        }

        return this.hash;
    },
    equals: function(that) {
        var result =
            that != null &&
            that.isVariable != null &&
            that.isVariable() &&
            this.name === that.name;

        return result;
    }
});

module.exports = Var;
