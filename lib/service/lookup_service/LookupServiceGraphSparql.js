var Class = require('../../ext/Class');
var LookupServiceBase = require('./LookupServiceBase');
var ServiceUtils = require('../ServiceUtils');
var HashMap = require('../../util/collection/HashMap');
var GraphImpl = require('../../rdf/GraphImpl');

var GraphUtils = require('../../rdf/GraphUtils');

/**
 * Looks up RDF Graphs based on given subject URIs via a SPARQL service
 */
var LookupServiceGraphSparql = Class.create(LookupServiceBase, {
    initialize: function(sparqlService) {
        this.sparqlService = sparqlService;
    },

    lookup: function(subjects) {
        var promise = ServiceUtils.execDescribeViaSelect(this.sparqlService, subjects);

        var result = promise.then(function(graph) {
            var r = new HashMap();

            // Allocate a fresh graph for each subject, so that each requested subject gets a graph
            subjects.forEach(function(subject) {
                r.put(subject, new GraphImpl());
            });

            GraphUtils.indexBySubject(graph, r);

            return r;
        });

        return result;
    }

});



module.exports = LookupServiceGraphSparql;
