var Class = require('../../ext/Class');
var SparqlService = require('./SparqlService');

var ElementGroup = require('../../sparql/element/ElementGroup');


/**
 * This function attempts to divide a query's graph pattern into
 * a 'core' graph pattern which should be selective, and a set of filters which
 * are non-selective.
 * The intent is to be able to limit the set of resources before applying non-
 * selective filters.
 *
 * Original:
 * {
 *     ?x ?y ?z .
 *     Filter(regex(?x, 'foo').
 *     Filter(?Bar = 'baz');
 * }
 *
 * Transformed:
 *
 * {
 *   { Select * {
 *    ?x ?y ?z
 *    Filter(?Bar = 'baz');
 *   } Limit 100000
 *   Filter(regex(?x, 'foo'). // unreliable filters moved outside
 * }
 *
 */
var SparqlServiceReliableLimit = Class.create({
    initialize: function(delegate) {

    },

    createQueryExecution: function(query) {

    },

    applyTransform: function(query) {
        var e = query.getQueryPattern();

        if(e instanceof ElementGroup) {
            var elements = e.getArgs();

            var r = []; // reliable filters
            var u = []; // unreliable filters
            // optionals

            elements.forEach(function() {

            });


        }

    }
});

module.exports = SparqlServiceReliableLimit;
