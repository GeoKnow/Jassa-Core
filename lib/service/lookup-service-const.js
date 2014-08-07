var LookupServiceBase = require('./lookup-service-base');
var HashMap = require('../util/hash-map');

var LookupServiceConst = function(data) {
    LookupServiceBase.call(this);

    this.initialize(data);
};
// inherit
LookupServiceConst.prototype = Object.create(LookupServiceBase.prototype);
// hand back the constructor
LookupServiceConst.prototype.constructor = LookupServiceConst;


LookupServiceConst.prototype.initialize = function(data) {
    this.data = data;
};

LookupServiceConst.prototype.lookup = function(keys) {
    var map = new HashMap();
    var self = this;
    keys.forEach(function(key) {
        map.put(key, self.data);
    });

    var deferred = jQuery.Deferred();
    deferred.resolve(map);
    return deferred.promise();
};

module.exports = LookupServiceConst;
