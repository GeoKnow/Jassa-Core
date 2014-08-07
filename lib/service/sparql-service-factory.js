var SparqlServiceFactory = function() {};

SparqlServiceFactory.prototype.createSparqlService = function() {
    throw 'Not overridden';
};

module.exports = SparqlServiceFactory;
