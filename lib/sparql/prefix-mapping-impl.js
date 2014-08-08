var Class = require('../ext/class');

// helper function
var startsWith = function(str, starts) {
    if (starts === '') {
        return true;
    }
    if (str === null || starts === null) {
        return false;
    }
    str = String(str);
    starts = String(starts);
    return str.length >= starts.length && str.slice(0, starts.length) === starts;
};
var isFunction = function(obj) {
    return typeof obj === 'function';
};
var extend = function(obj, source) {
    var prop;
    for (prop in source) {
        if (hasOwnProperty.call(source, prop)) {
            obj[prop] = source[prop];
        }
    }
    return obj;
};

var PrefixMappingImpl = Class.create({
    initialize: function(prefixes) {
        this.prefixes = prefixes ? prefixes : {};
    },

    expandPrefix: function() {
        throw 'Not implemented yet - sorry';
    },

    getNsPrefixMap: function() {
        return this.prefixes;
    },

    getNsPrefixURI: function(prefix) {
        return this.prefixes[prefix];
    },

    /**
     * Answer the prefix for the given URI, or null if there isn't one.
     */
    getNsURIPrefix: function(uri) {
        var result = null;
        var bestNs = null;

        this.prefixes.forEach(function(u, prefix) {
            if (startsWith(uri, u)) {
                if (!bestNs || (u.length > bestNs.length)) {
                    result = prefix;
                    bestNs = u;
                }
            }
        });

        return result;
    },

    qnameFor: function() {

    },

    removeNsPrefix: function(prefix) {
        delete this.prefixes[prefix];
    },

    samePrefixMappingAs: function() {
        throw 'Not implemented yet - Sorry';
    },

    setNsPrefix: function(prefix, uri) {
        this.prefixes[prefix] = uri;

        return this;
    },

    setNsPrefixes: function(obj) {
        var json = isFunction(obj.getNsPrefixMap) ? obj.getNsPrefixMap() : obj;

        var self = this;
        json.forEach(function(uri, prefix) {
            self.setNsPrefix(prefix, uri);
        });

        return this;
    },

    shortForm: function(uri) {
        var prefix = this.getNsPrefixURI(uri);

        var result;
        if (prefix) {

            var u = this.prefixes[uri];
            var qname = uri.substring(u.length);

            result = prefix + ':' + qname;
        } else {
            result = uri;
        }

        return result;
    },

    addPrefix: function(prefix, urlBase) {
        this.prefixes[prefix] = urlBase;
    },

    getPrefix: function(prefix) {
        var result = this.prefixes[prefix];
        return result;
    },

    addJson: function(json) {
        extend(this.prefixes, json);
    },

    getJson: function() {
        return this.prefixes;
    },
});

module.exports = PrefixMappingImpl;