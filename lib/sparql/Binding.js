var NodeFactory = require('../rdf/NodeFactory');
var Var = require('../rdf/node/Var');

/**
 * A binding is a map from variables to entries.
 * An entry is a on object {v: sparql.Var, node: sparql.Node }
 *
 * The main speciality of this object is that
 * .entries() returns a *sorted* array of variable bindings (sorted by the variable name).
 *  .toString() re-uses the ordering.
 *
 * This means, that two bindings are equal if their strings are equal.
 *
 * TODO We could generalize this behaviour into some 'base class'.
 *
 *
 */
var Binding = function(varNameToEntry) {
    this.varNameToEntry = varNameToEntry ? varNameToEntry : {};
};

/**
 * Create method in case the variables are not objects
 *
 * TODO Replace with an ordinary hashMap.
 */
Binding.create = function(varNameToNode) {

    var tmp = {};
    for (var vStr in varNameToNode) {
        var node = varNameToNode[vStr];
        tmp[vStr] = {
            v: NodeFactory.createVar(vStr),
            node: node,
        };
    }

    var result = new Binding(tmp);
    return result;
};

Binding.fromTalisJson = function(b) {

    var tmp = {};
    for (var k in b) {
        var val = b[k];
        // var v = rdf.Node.v(k);
        var node = NodeFactory.createFromTalisRdfJson(val);
        tmp[k] = node;
    }

    var result = Binding.create(tmp);

    return result;
};

Binding.prototype = {
    put: function(v, node) {
        this.varNameToEntry[v.getName()] = {
            v: v,
            node: node,
        };
    },

    get: function(v) {
        if (!(v instanceof Var)) {
            throw 'var not an instance of Var';
        }
        var varName = v.getName();

        var entry = this.varNameToEntry[varName];

        var result = entry ? entry.node : null;

        return result;
    },

    entries: function() {
        var tmp = [];
        for (var k in this.varNameToEntry) {
            var val = this.varNameToEntry[k];
            tmp.push(val);
        }
        var result = tmp.sort(function(entry1, entry2) {
            return entry1.v.getName() > entry2.v.getName() ? 1 : -1;
        });
        return result;
    },

    toString: function() {
        var e = this.entries();

        // var result = "[" + e.join()

        var tmp = e.map(function(item) {
            return '"' + item.v.getName() + '": "' + item.node + '"';
        });

        var result = '{' + tmp.join(', ') + '}';

        return result;
    },

    getVars: function() {
        var result = [];

        for (var k in this.varNameToEntry) {
            var entry = this.varNameToEntry[k];
            result.push(entry.v);
        }

        return result;
    },
};

module.exports = Binding;
