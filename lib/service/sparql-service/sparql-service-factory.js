var Class = require('../../ext/Class');

var SparqlServiceFactory = Class.create({
    createSparqlService: function() {
        throw 'Not overridden';
    },
});

module.exports = SparqlServiceFactory;
