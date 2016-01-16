var Class = require('../../ext/Class');
var HashSet = require('./HashSet');

var SetDelegate = Class.create({
    initialize: function(sets) {
        this._sets = sets;
    },

    delegate: function() {
        throw new Error('Delegate method not overridden');
    },


    isEmpty: function() {
        var result = this.delegate().isEmpty();
        return result;
    },

    add: function(item) {
        throw new Error('Cannot insert into a set view.');
    },

    hashCode: function() {
        var result = this.delegate().hashCode();
        return result;
    },

    equals: function(that) {

        var result =
            that != null &&
            that.delegate().equals(that);

        return result;
    },
    /*
    clone: function() {
        var result = new HashSet(this.map.fnEquals, this.map.fnHash);

        return result;
    },*/

    contains: function(item) {
        var result = this.delegate().contains(item);

        return result;
    },

    forEach: function(fn) {
        this.delegate().forEach(fn);
},

    map: function(fn) {
        var result = this.delegate().map(fn);
        return result;
    },

    retainAll: function(otherSet) {
        throw new Error('Cannot modify read only set view');
    },

    addAll: function(otherSet) {
        throw new Error('Cannot modify read only set view');
    },

    removeAll: function(otherSet) {
        throw new Error('Cannot modify read only set view');
    },

    remove: function(item) {
        throw new Error('Cannot modify read only set view');
    },

    entries: function() {
        var result = this.delegate().entries();
        return result;
    },

    clear: function() {
        throw new Error('Cannot modify read only set view');
    },

    toString: function() {
        var result = this.delegate().toString();
        return result;
    },

    size: function() {
        var result = this.delegate().size();
        return result;
    }
});

module.exports = SetDelegate;
