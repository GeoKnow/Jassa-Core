var Class = require('../ext/class');

// helper
var getSubstitute = function(node, fnNodeMap) {
    var result = fnNodeMap(node);
    if (!result) {
        result = node;
    }
    return result;
};

// constructor
var Triple = Class.create({
    classLabel: 'jassa.rdf.Triple',

    // functions
    initialize: function(s, p, o) {
        this.s = s;
        this.p = p;
        this.o = o;
    },
    toString: function() {
        return this.s + ' ' + this.p + ' ' + this.o;
    },
    copySubstitute: function(fnNodeMap) {
        var result = new Triple(
            getSubstitute(this.s, fnNodeMap),
            getSubstitute(this.p, fnNodeMap),
            getSubstitute(this.o, fnNodeMap)
        );
        return result;
    },
    getSubject: function() {
        return this.s;
    },
    getProperty: function() {
        return this.p;
    },
    getObject: function() {
        return this.o;
    },
    getVarsMentioned: function() {
        var result = [];
        Triple.pushVar(result, this.s);
        Triple.pushVar(result, this.p);
        Triple.pushVar(result, this.o);
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