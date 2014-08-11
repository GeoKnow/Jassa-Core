var Class = require('../../ext/class');
var LookupServiceBase = require('./lookup-service-base');
var HashMap = require('../../util/hash-map');

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
