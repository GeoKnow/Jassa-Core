var Class = require('../ext/Class');

var HashSet = require('../util/collection/HashSet');

var GraphImpl = Class.create({
    initialize: function() {
        this.triples = new HashSet();
    },

    add: function(triple) {
        this.triples.add(triple);
    },

    remove: function(triple) {
        this.triples.remove(triple);
    },

    forEach: function(callback) {
        this.triples.forEach(callback);
    },

    // filter
    // every
    // match
    // merge (just a convenience for x = new Graph(); x.addAll(otherGraph)


    // Adds items from a .forEach-able object (i.e. graph or array of triples)
    addAll: function(otherGraph) {
        var self = this;
        otherGraph.forEach(function(triple) {
            self.add(triple);
        });
    },

    clear: function() {
        this.triples.clear();
    },

    toArray: function() {
        var result = this.triples.entries();
        return result;
    }

});

module.exports = GraphImpl;

