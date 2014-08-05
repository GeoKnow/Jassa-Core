// constructor
var Triple = function(s, p, o) {
    this.classLabel = 'jassa.rdf.Triple';

    // init
    this.initialize(s, p, o);
};

// helper
var getSubstitute = function(node, fnNodeMap) {
    var result = fnNodeMap(node);
    if (!result) {
        result = node;
    }
    return result;
};

// functions
Triple.prototype.initialize = function(s, p, o) {
    this.s = s;
    this.p = p;
    this.o = o;
};
Triple.prototype.toString = function() {
    return this.s + ' ' + this.p + ' ' + this.o;
};
Triple.prototype.copySubstitute = function(fnNodeMap) {
    var result = new Triple(
        getSubstitute(this.s, fnNodeMap),
        getSubstitute(this.p, fnNodeMap),
        getSubstitute(this.o, fnNodeMap)
    );
    return result;
};
Triple.prototype.getSubject = function() {
    return this.s;
};
Triple.prototype.getProperty = function() {
    return this.p;
};
Triple.prototype.getObject = function() {
    return this.o;
};
Triple.prototype.getVarsMentioned = function() {
    var result = [];
    Triple.pushVar(result, this.s);
    Triple.pushVar(result, this.p);
    Triple.pushVar(result, this.o);
    return result;
};
Triple.prototype.pushVar = function(array, node) {
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
};

module.exports = Triple;
