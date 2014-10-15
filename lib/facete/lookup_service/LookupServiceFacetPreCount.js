var Class = require('../../ext/Class');

var VarUtils = require('../../sparql/VarUtils');
var CountUtils = require('../CountUtils');
var HashMap = require('../../util/collection/HashMap');

var LookupService = require('../../service/lookup_service/LookupService');


var LookupServiceFacetPreCount = Class.create(LookupService, {
    initialize: function(sparqlService, facetRelationIndex) {
        this.sparqlService = sparqlService;
        this.facetRelationIndex = facetRelationIndex;
        this.rowLimit = 10000;
    },

    lookup: function(properties) {
        var rowLimit = this.rowLimit;

        var countVar = VarUtils.c;

        // Perform lookup with rowLimit + 1
        var subQueries = CountUtils.createQueriesPreCount(this.facetRelationIndex, countVar, properties, rowLimit + 1);
        var exec = CountUtils.execQueries(this.sparqlService, subQueries, this.facetRelationIndex.getSourceVar(), countVar);

        var result = exec.then(function(map) {
            var r = new HashMap();

            var entries = map.entries();
            entries.forEach(function(entry) {
                var property = entry.key;
                var count = entry.val;

                var hasMoreItems = count > rowLimit;
                var countInfo = {
                    count: hasMoreItems ? rowLimit : count,
                    hasMoreItems: hasMoreItems
                };

                r.put(property, countInfo);
            });

            return r;
        });

        return result;
    },

});


module.exports = LookupServiceFacetPreCount;
