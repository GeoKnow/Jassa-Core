var LookupServiceDelegateBase = require('./lookup-service-delegate-base');
var HashMap = require('../../util/hash-map');
var Promise = require('bluebird');

var defer = function() {
    var resolve, reject;
    var promise = new Promise(function() {
        resolve = arguments[0];
        reject = arguments[1];
    });
    return {
        resolve: resolve,
        reject: reject,
        promise: promise
    };
};

/**
 * Wrapper that collects ids for a certain amount of time before passing it on to the
 * underlying lookup service.
 */
var LookupServiceTimeout = function(delegate, delayInMs, maxRefreshCount) {
    LookupServiceDelegateBase.call(this, delegate);

    this.initialize(delegate, delayInMs, maxRefreshCount);
};
// inherit
LookupServiceTimeout.prototype = Object.create(LookupServiceDelegateBase.prototype);
// hand back the constructor
LookupServiceTimeout.prototype.constructor = LookupServiceTimeout;



LookupServiceTimeout.prototype.initialize = function(delegate, delayInMs, maxRefreshCount) {
    this.delayInMs = delayInMs;
    this.maxRefreshCount = maxRefreshCount || 0;

    this.idStrToId = {};
    this.currentDeferred = null;
    this.currentPromise = null;
    this.currentTimer = null;
    this.currentRefreshCount = 0;
};

LookupServiceTimeout.prototype.getIdStr = function(id) {
    var result = this.delegate.getIdStr(id);
    return result;
};

LookupServiceTimeout.prototype.lookup = function(ids) {
    if (!this.currentDeferred) {
        this.currentDeferred = defer();
        this.currentPromise = this.currentDeferred.promise();
    }

    var self = this;
    ids.forEach(function(id) {
        var idStr = self.getIdStr(id);
        var val = self.idStrToId[idStr];
        if (!val) {
            self.idStrToId[idStr] = id;
        }
    });

    if (!this.currentTimer) {
        this.startTimer();
    }

    // Filter the result by the ids which we requested
    var result = this.currentPromise.then(function(map) {
        var r = new HashMap();
        ids.forEach(function(id) {
            var val = map.get(id);
            r.put(id, val);
        });
        return r;
    });


    return result;
};

LookupServiceTimeout.prototype.startTimer = function() {

    var self = this;
    var seenRefereshCount = this.currentRefreshCount;
    var deferred = self.currentDeferred;

    this.currentTimer = setTimeout(function() {

        if (self.maxRefreshCount < 0 || seenRefereshCount < self.maxRefreshCount) {
            //clearTimeout(this.currentTimer);
            ++self.currentRefreshCount;
            self.startTimer();
            return;
        }

        var ids = [];
        for(var key in self.idStrToId) {
            ids.push(self.idStrToId[key]);
        }

        self.idStrToId = {};
        self.currentRefreshCount = 0;
        self.currentDeferred = null;
        self.currentTimer = null;

        self.delegate
        .lookup(ids)
        .then(function(map) {
            deferred.resolve(map);
        });
    }, this.delayInMs);
};