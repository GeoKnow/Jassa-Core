var Class = require('../ext/Class');
var NodeUtils = require('../rdf/NodeUtils');

var Triple = require('../rdf/Triple');

// constructor
var Quad = Class.create({
    classLabel: 'jassa.rdf.Quad',

    // functions
    initialize: function(graph, subject, predicate, object) {
        this.graph = graph;
        this.subject = subject;
        this.predicate = predicate;
        this.object = object;
    },

    asTriple: function() {
        var result = new Triple(this.subject, this.prediacte, this.object);
        return result;
    },

    toString: function() {
        return this.graph + ' ' + this.subject + ' ' + this.predicate + ' ' + this.object;
    },
    copySubstitute: function(fnNodeMap) {
        var result = new Quad(
            NodeUtils.getSubstitute(this.graph, fnNodeMap),
            NodeUtils.getSubstitute(this.subject, fnNodeMap),
            NodeUtils.getSubstitute(this.predicate, fnNodeMap),
            NodeUtils.getSubstitute(this.object, fnNodeMap)
        );
        return result;
    },

    getGraph: function() {
        return this.graph;
    },

    getSubject: function() {
        return this.subject;
    },

    getPredicate: function() {
        return this.predicate;
    },

    getObject: function() {
        return this.object;
    },

    getVarsMentioned: function() {
        var result = [];
        NodeUtils.pushVar(result, this.graph);
        NodeUtils.pushVar(result, this.subject);
        NodeUtils.pushVar(result, this.predicate);
        NodeUtils.pushVar(result, this.object);
        return result;
    },

});

module.exports = Triple;
