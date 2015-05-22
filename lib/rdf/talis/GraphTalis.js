/**
 * Implementation of the graph interface based on Talis RDF Json
 */
var Class = require('../../ext/Class');

var HashSet = require('../../util/collection/HashSet');

var Triple = require('../Triple');
var TripleUtils = require('../TripleUtils');

var ObjectUtils = require('../../util/ObjectUtils');


/**
 * Graph interface implemented on top of a Talis RDF Json structure
 *
 */
var GraphTalis = Class.create({
    initialize: function(data) {
        this.data = data || {};
    },

    isEmpty: function() {
        var result = this.size() === 0;
        return result;
    },

    equals: function() {
        throw new Error('Not implemented yet');
    },

    hashCode: function() {
        var result = ObjectUtils.hashCode(this.data);
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

    removeAll: function(triples) {
        this.triples.removeAll(triples);
    },

    removeMatch: function(pattern) {
        //var pattern = new Triple(s, p, o);

        var removals = [];
        this.triples.forEach(function(triple) {
            var isMatch = TripleUtils.matches(pattern, triple);
            if(isMatch) {
                removals.push(triple);
            }
        });
        //console.log('removals: ', removals);
        this.removeAll(removals);
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

module.exports = GraphTalis;

