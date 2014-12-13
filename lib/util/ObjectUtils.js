var isEqual = require('lodash.isequal');

var JsonUtils = require('./JsonUtils');

var ObjectUtils = {
    isEmptyString: function(str) {
        var result = str == null || str.length === 0 || str.trim() === '';
        return result;
    },

    isObject: function(obj) {
        var type = typeof obj;
        return type === 'function' || type === 'object' && Boolean(obj);
    },

    isFunction: function(obj) {
        return typeof obj === 'function';
    },

    isString: function(obj) {
        return Object.prototype.toString.call(obj) === '[object String]';
    },

    extend: function(obj, source) {
        for (var prop in source) {
            if (hasOwnProperty.call(source, prop)) {
                obj[prop] = source[prop];
            }
        }
        return obj;
    },

    isEqual: function(a, b) {
        var result;
        if (a && a.equals) {
            result = a.equals(b);
        } else if (b && b.equals) {
            result = b.equals(a);
        } else {
            result = isEqual(a, b);
        }

        return result;
    },

    defaultHashCode: function(a) {
        var result;
        if (a && a.hashCode) {
            result = a.hashCode();
        } else {
            result = a.toString();
        }

        return result;
    },

    /**
     * Used to turn copySubstitute into a clone method
     */
    identity: function(x) {
        return x;
    },

    // http://jsperf.com/hashing-strings
    hashCodeStr : function(str) {
        var res = 0,
        len = (str && str.length) ? str.length : 0;
        for (var i = 0; i < len; i++) {
            res = res * 31 + str.charCodeAt(i);
            res = res & res;
        }
        return res;
    },

    /**
     * Recursively iterate the object tree and use a .hashCode function if available
     * TODO Add support to exclude attributes
     */
    hashCode: function(obj, skipOnce) {

        var result = JsonUtils.stringifyCyclic(obj, function(key, val) {

            var r = null;

            if (!skipOnce && ObjectUtils.isObject(val)) {

                var hashFnName = null;
                ObjectUtils.defaultHashFnNames.some(function(name) {
                    if (ObjectUtils.isFunction(val[name])) {
                        hashFnName = name;
                        return true;
                    }
                });

                var fnHashCode = val[hashFnName];

                if (hashFnName && fnHashCode && ObjectUtils.isFunction(fnHashCode)) {
                    r = fnHashCode.apply(val);
                } else {
                    r = val;
                }

            } else {
                r = val;
            }

            if (skipOnce) {
                skipOnce = false;
            }

            return r;
        });

        return result;
    }
};

ObjectUtils.defaultHashFnNames = [
    'hashCode'
];

module.exports = ObjectUtils;
