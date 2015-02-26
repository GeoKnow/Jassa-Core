var Class = require('../ext/Class');

var HashSet = require('../util/collection/HashSet');

var GraphImpl = Class.create({
    initialize: function(triplesSet) {
        this.triples = triplesSet || new HashSet();

        var self = this;
//        Object.defineProperty(this, 'length', {
//            get: function() {
//                return self.triples.length;
//            }
//        });
    },

    equals: function() {
        throw new Error('Not implemented yet');
    },

    hashCode: function() {
        var result = this.triples.hashCode();
        return result;
    },

    add: function(triple) {
        var result = this.triples.add(triple);
        return result;
    },

    remove: function(triple) {
        var result = this.triples.remove(triple);
        return result;
    },

    forEach: function(callback) {
        this.triples.forEach(callback);
    },

    map: function(callback) {
        this.triples.map(callback);
    },

    contains: function(triple) {
        var result = this.triples.contains(triple);
        return result;
    },

    // filter
    // every
    // match
    // merge (just a convenience for x = new Graph(); x.addAll(otherGraph)


    // Adds items from a .forEach-able object (i.e. graph or array of triples)
    addAll: function(triples) {
        var self = this;
        triples.forEach(function(triple) {
            self.add(triple);
        });
    },

    clear: function() {
        this.triples.clear();
    },

    toArray: function() {
        var result = this.triples.entries();
        return result;
    },

    size: function() {
        var result = this.triples.size();
        return result;
    }

});

module.exports = GraphImpl;

