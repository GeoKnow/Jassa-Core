var Class = require('../../ext/class');

var SparqlServiceFactory = Class.create({
    createSparqlService: function() {
        throw 'Not overridden';
    },
});

module.exports = SparqlServiceFactory;
