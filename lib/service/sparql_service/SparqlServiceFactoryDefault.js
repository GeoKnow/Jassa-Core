var Class = require('../../ext/Class');
var SparqlServiceHttp = require('./SparqlServiceHttp');
var SparqlServiceCache = require('./SparqlServiceCache');

var SparqlServiceFactoryDefault = Class.create({
    initialize: function() {
        this.hashToCache = {};
    },

    createSparqlService: function(sparqlServiceIri, defaultGraphIris) {
        var tmp = new SparqlServiceHttp(sparqlServiceIri, defaultGraphIris);
        tmp = new SparqlServiceCache(tmp);

        var hash = tmp.getStateHash();

        var cacheEntry = this.hashToCache[hash];

        var result;
        if (cacheEntry) {
            result = cacheEntry;
        } else {
            this.hashToCache[hash] = tmp;
            result = tmp;
        }

        return result;
    },
});

module.exports = SparqlServiceFactoryDefault;
