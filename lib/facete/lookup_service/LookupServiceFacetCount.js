var Class = require('../../ext/Class');

var HashMap = require('../../util/collection/HashMap');

var VarUtils = require('../../sparql/VarUtils');
var CountUtils = require('../CountUtils');

var LookupService = require('../../service/lookup_service/LookupService');

var shared = require('../../util/shared');
var Promise = shared.Promise;

var LookupServiceFacetCount = Class.create(LookupService, {
    initialize: function(lsPreCount, lsExactCount) {
        this.lsPreCount = lsPreCount;
        this.lsExactCount = lsExactCount;
    },

    lookup: function(properties) {
        var self = this;

        var result = Promise
            .resolve(this.lsPreCount.lookup(properties))
            .then(function(preMap) {
                var entries = preMap.entries();

                var winners = [];
                entries.forEach(function(entry) {
                    var key = entry.key;
                    var countInfo = entry.val;

                    if(countInfo.hasMoreItems === false) {
                        winners.push(key);
                    }
                });

                // Check which properties succeeded on the pre-count
                var r = self.lsExactCount.lookup(winners);
                return [preMap, r];
            }).spread(function(preMap, exactMap) {
                var r = new HashMap();
                properties.forEach(function(property) {
                    var countInfo = exactMap.get(property);
                    countInfo = countInfo || preMap.get(property);
                    // Note: Pre counting by schema may yield properties that do not have an extension
                    countInfo = countInfo || { count: 0, hasMoreItems: false };
/*
                    if(!countInfo) {
                        throw new Error('Should not happen: No facet count obtained for property: ' + property + ' ; entries were: ' + properties);// + ' with pre mappings ' + preMap + ' and exact mappings: ' + exactMap);
                    }
*/

                    r.put(property, countInfo);
                });
                return r;
            });

        return result;
    },

});


module.exports = LookupServiceFacetCount;
