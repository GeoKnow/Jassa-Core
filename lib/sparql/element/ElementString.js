var Class = require('../../ext/Class');
var Element = require('./Element');

var SparqlString = require('../SparqlString');


/**
 * An element that injects a string "as is" into a query.
 *
 */
var ElementString = Class.create(Element, {
    classLabel: 'jassa.sparql.ElementString',

    initialize: function(sparqlString) {
//          if(_(sparqlString).isString()) {
//              debugger;
//          }
        this.sparqlString = sparqlString;
    },

    getArgs: function() {
        return [];
    },

    copy: function(args) {
        if(args.length !== 0) {
            throw new Error('Invalid argument');
        }

        // FIXME: Should we clone the attributes too?
        //var result = new ns.ElementString(this.sparqlString);
        return this;
    },

    toString: function() {
        return this.sparqlString.getString();
    },

    copySubstitute: function(fnNodeMap) {
        var newSparqlString = this.sparqlString.copySubstitute(fnNodeMap);
        return new ElementString(newSparqlString);
    },

    getVarsMentioned: function() {
        return this.sparqlString.getVarsMentioned();
    },

    flatten: function() {
        return this;
    }
});


ElementString.create = function(str, varNames) {
    var sparqlStr = SparqlString.create(str, varNames);
    var result = new ElementString(sparqlStr);
    return result;
};

module.exports = ElementString;
