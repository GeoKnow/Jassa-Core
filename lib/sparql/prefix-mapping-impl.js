var PrefixMappingImpl = function(prefixes) {
    this.initialize(prefixes);
};

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

// functions
PrefixMappingImpl.prototype.initialize = function(prefixes) {
    this.prefixes = prefixes ? prefixes : {};
};

PrefixMappingImpl.prototype.expandPrefix = function() {
    throw 'Not implemented yet - sorry';
};

PrefixMappingImpl.prototype.getNsPrefixMap = function() {
    return this.prefixes;
};

PrefixMappingImpl.prototype.getNsPrefixURI = function(prefix) {
    return this.prefixes[prefix];
};

/**
 * Answer the prefix for the given URI, or null if there isn't one.
 */
PrefixMappingImpl.prototype.getNsURIPrefix = function(uri) {
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
};

PrefixMappingImpl.prototype.qnameFor = function() {

};

PrefixMappingImpl.prototype.removeNsPrefix = function(prefix) {
    delete this.prefixes[prefix];
};

PrefixMappingImpl.prototype.samePrefixMappingAs = function() {
    throw 'Not implemented yet - Sorry';
};

PrefixMappingImpl.prototype.setNsPrefix = function(prefix, uri) {
    this.prefixes[prefix] = uri;

    return this;
};

PrefixMappingImpl.prototype.setNsPrefixes = function(obj) {
    var json = isFunction(obj.getNsPrefixMap) ? obj.getNsPrefixMap() : obj;

    var self = this;
    json.forEach(function(uri, prefix) {
        self.setNsPrefix(prefix, uri);
    });

    return this;
};

PrefixMappingImpl.prototype.shortForm = function(uri) {
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
};

PrefixMappingImpl.prototype.addPrefix = function(prefix, urlBase) {
    this.prefixes[prefix] = urlBase;
};

PrefixMappingImpl.prototype.getPrefix = function(prefix) {
    var result = this.prefixes[prefix];
    return result;
};

PrefixMappingImpl.prototype.addJson = function(json) {
    extend(this.prefixes, json);
};

PrefixMappingImpl.prototype.getJson = function() {
    return this.prefixes;
};

module.exports = PrefixMappingImpl;