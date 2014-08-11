var Class = require('../ext/class');
var NodeFactory = require('../rdf/node-factory');
var extractSparqlVars = require('./extract-sparql-vars');

/**
 * An string object that supports variable substitution and extraction
 * to be used for ElementString and ExprString
 *
 */
var SparqlString = Class.create({
    classLabel: 'jassa.sparql.SparqlString',

    initialize: function(value, varsMentioned) {
        this.value = value;
        this.varsMentioned = varsMentioned ? varsMentioned : [];
    },

    toString: function() {
        return this.value;
    },

    getString: function() {
        return this.value;
    },

    copySubstitute: function(fnNodeMap) {
        var str = this.value;
        var newVarsMentioned = [];

        // Avoid double substitution of variables by using some unlikely prefix
        // instead of the question mark
        var placeholder = '@@@@';
        var reAllPlaceholders = new RegExp(placeholder, 'g');

        this.varsMentioned.forEach(function(v) {

            // A variable must not end in \w (this equals: _, [0-9], [a-z] or [a-Z])
            var reStr = '\\?' + v.getName() + '([^\\w])?';
            var re = new RegExp(reStr, 'g');

            var node = fnNodeMap(v);
            if (node) {
                //console.log('Node is ', node);

                var replacement;
                if (node.isVariable()) {
                    //console.log('Var is ' + node + ' ', node);

                    replacement = placeholder + node.getName();

                    newVarsMentioned.push(node);
                } else {
                    replacement = node.toString();
                }

                //var
                str = str.replace(re, replacement + '$1');
            } else {
                newVarsMentioned.push(v);
            }
        });

        str = str.replace(reAllPlaceholders, '?');

        return new SparqlString(str, newVarsMentioned);
    },

    getVarsMentioned: function() {
        return this.varsMentioned;
    },

    create: function(str, varNames) {
        var vars;
        if (varNames !== null) {
            vars = varNames.map(function(varName) {
                return NodeFactory.createVar(varName);
            });
        } else {
            vars = extractSparqlVars(str);
        }
        //vars = vars ? vars :

        var result = new SparqlString(str, vars);
        return result;
    },
});

module.exports = SparqlString;
