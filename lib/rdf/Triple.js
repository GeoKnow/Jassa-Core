var Class = require('../ext/Class');

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
            getSubstitute(this.subject, fnNodeMap),
            getSubstitute(this.predicate, fnNodeMap),
            getSubstitute(this.object, fnNodeMap)
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
        Triple.pushVar(result, this.subject);
        Triple.pushVar(result, this.predicate);
        Triple.pushVar(result, this.object);
        return result;
    },
    pushVar: function(array, node) {
        if (node.isVariable()) {
            var c = false;
            array.forEach(function(item) {
                c = c || node.equals(item);
            });

            if (!c) {
                array.push(node);
            }
        }
        return array;
    },
});

module.exports = Triple;
