var Class = require('../../ext/Class');

var SparqlServiceFactory = Class.create({
    createSparqlService: function() {
        throw new Error('Not overridden');
    },
});

module.exports = SparqlServiceFactory;
