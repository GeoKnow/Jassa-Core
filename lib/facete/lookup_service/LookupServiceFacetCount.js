var Class = require('../../ext/Class');

var HashMap = require('../../util/collection/HashMap');

var VarUtils = require('../../sparql/VarUtils');
var CountUtils = require('../CountUtils');

var LookupService = require('../../service/lookup_service/LookupService');

var LookupServiceFacetCount = Class.create(LookupService, {
    initialize: function(lsPreCount, lsExactCount) {
        this.lsPreCount = lsPreCount;
        this.lsExactCount = lsExactCount;
    },

    lookup: function(properties) {
        var self = this;

        var result = this.lsPreCount.lookup(properties).then(function(preMap) {
            var entries = preMap.entries();
            
            var winners = [];
            entries.forEach(function(entry) {
                var key = entry.key;
                var countInfo = entry.val;
                
                if(!countInfo.hasMoreItems) {
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
                if(!countInfo) {
                    throw new Error('Should not happen');
                }
                
                r.put(property, countInfo);
            });
            return r;
        });
        
        return result;
    },

});


module.exports = LookupServiceFacetCount;
