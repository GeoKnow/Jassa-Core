var Class = require('../../ext/class');

var SparqlServiceFactoryConst = Class.create({
    initialize: function(sparqlService) {
        this.sparqlService = sparqlService;
    },

    createSparqlService: function() {
        var result = this.sparqlService;

        if (result === null) {
            console.log('[ERROR] Creation of a SPARQL service requested, but none was provided');
            throw 'Bailing out';
        }

        return result;
    },

    setSparqlService: function(sparqlService) {
        this.sparqlService = sparqlService;
    },
});

module.exports = SparqlServiceFactoryConst;
