var Class = require('../../ext/Class');
var LookupServiceBase = require('./LookupServiceBase');
var ServiceUtils = require('../ServiceUtils');
var HashMap = require('../../util/collection/HashMap');
var GraphImpl = require('../../rdf/GraphImpl');

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

            // Allocate a fresh graph for each subject
            subjects.forEach(function(subject) {
                r.put(subject, new GraphImpl());
            });

            // Partition the graph returned by the request by the subjects
            graph.forEach(function(triple) {
                var s = triple.getSubject();
                var subGraph = r.get(s);
                if(!subGraph) {
                    console.log('Should not happen');
                } else {
                    subGraph.add(triple);
                }
            });

            return r;
        });

        return result;
    }

});



module.exports = LookupServiceGraphSparql;
