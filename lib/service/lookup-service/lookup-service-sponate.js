var LookupServiceBase = require('./lookup-service-base');
var HashMap = require('../../util/hash-map');

var LookupServiceSponate = function(source) {
    LookupServiceBase.call(this);

    this.initialize(source);
};
// inherit
LookupServiceSponate.prototype = Object.create(LookupServiceBase.prototype);
// hand back the constructor
LookupServiceSponate.prototype.constructor = LookupServiceSponate;


LookupServiceSponate.prototype.initialize = function(source) {
    // Note: By source we mean e.g. store.labels
    this.source = source;
};

LookupServiceSponate.prototype.lookup = function(nodes) {
    var result = this.source.find().nodes(nodes).asList(true).pipe(function(docs) {
        var r = new HashMap();
        docs.forEach(function(doc) {
            r.put(doc.id, doc);
        });
        return r;
    });

    return result;
};

module.exports = LookupServiceSponate;
