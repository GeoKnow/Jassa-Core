var Class = require('../ext/Class');
var NodeUtils = require('./NodeUtils');

// constructor
var Triple = Class.create({
    classLabel: 'jassa.rdf.Triple',

    // functions
    initialize: function(subject, predicate, object) {
        this.subject = subject;
        this.predicate = predicate;
        this.object = object;
    },
    toString: function() {
        return this.subject + ' ' + this.predicate + ' ' + this.object;
    },
    copySubstitute: function(fnNodeMap) {
        var result = new Triple(
            NodeUtils.getSubstitute(this.subject, fnNodeMap),
            NodeUtils.getSubstitute(this.predicate, fnNodeMap),
            NodeUtils.getSubstitute(this.object, fnNodeMap)
        );
        return result;
    },
    getSubject: function() {
        return this.subject;
    },
    getProperty: function() {
        return this.predicate;
    },
    getObject: function() {
        return this.object;
    },
    getVarsMentioned: function() {
        var result = [];
        NodeUtils.pushVar(result, this.subject);
        NodeUtils.pushVar(result, this.predicate);
        NodeUtils.pushVar(result, this.object);
        return result;
    },

});

module.exports = Triple;
