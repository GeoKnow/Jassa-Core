var Class = require('../../ext/Class');
var ObjectUtils = require('../../util/ObjectUtils');

/**
 * Falsy valued arguments will be replaced with empty strings or 0
 */
var Coordinate = Class.create({
    initialize: function(s, p, i, c) {
        this.s = s || '';
        this.p = p || '';
        this.i = i || 0;
        this.c = c || '';
    },

    equals: function(that) {
        var result = this.s === that.s && this.p === that.p && this.i === that.i && this.c === that.c;
        return result;
    },

    hashCode: function() {
        if(this.hash == null) {
            this.hash =
                ObjectUtils.hashCodeStr(this.s) +
                3 * ObjectUtils.hashCodeStr(this.p) +
                7 * this.i +
                11 * ObjectUtils.hashCodeStr(this.c);
        }

        return this.hash;
    },

    toString: function() {
        var result = this.s + ' ' + this.p + ' ' + this.i + ' ' + this.c;
        return result;
    },
});

module.exports = Coordinate;
