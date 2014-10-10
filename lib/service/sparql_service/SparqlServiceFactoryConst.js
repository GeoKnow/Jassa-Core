var Class = require('../../ext/Class');

var SparqlServiceFactoryConst = Class.create({
    initialize: function(sparqlService) {
        this.sparqlService = sparqlService;
    },

    createSparqlService: function() {
        var result = this.sparqlService;

        if (result == null) {
            throw new Error('[ERROR] Creation of a SPARQL service requested, but none was provided');
        }

        return result;
    },

    setSparqlService: function(sparqlService) {
        this.sparqlService = sparqlService;
    },
});

module.exports = SparqlServiceFactoryConst;
