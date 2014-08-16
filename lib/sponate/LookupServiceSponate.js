var Class = require('../../ext/Class');
var LookupServiceBase = require('../service/lookup_service/LookupServiceBase');
var HashMap = require('../util/collection/HashMap');

var LookupServiceSponate = Class.create(LookupServiceBase, {
    initialize: function(source) {
        // Note: By source we mean e.g. store.labels
        this.source = source;
    },

    lookup: function(nodes) {
        var result = this.source.find().nodes(nodes).asList(true).then(function(docs) {
            var r = new HashMap();
            docs.forEach(function(doc) {
                r.put(doc.id, doc);
            });
            return r;
        });

        return result;
    },
});

module.exports = LookupServiceSponate;
