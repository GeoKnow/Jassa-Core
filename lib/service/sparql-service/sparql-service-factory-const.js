var SparqlServiceFactoryConst = function() {};

SparqlServiceFactoryConst.prototype.initialize = function(sparqlService) {
    this.sparqlService = sparqlService;
};

SparqlServiceFactoryConst.prototype.createSparqlService = function() {
    var result = this.sparqlService;

    if (result === null) {
        console.log('[ERROR] Creation of a SPARQL service requested, but none was provided');
        throw 'Bailing out';
    }

    return result;
};

SparqlServiceFactoryConst.prototype.setSparqlService = function(sparqlService) {
    this.sparqlService = sparqlService;
};

module.exports = SparqlServiceFactoryConst;