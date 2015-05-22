var uniq = require('lodash.uniq');

var StringUtils = {

    capitalize: function(s) {
        return s && s[0].toUpperCase() + s.slice(1);
    },

    createFnPrefix: function(prefix, isNullOnNull) {
        return function(str) {
            var r = isNullOnNull && str == null ? null : prefix + str;
            return r;
        };
    },

    createFnSuffix: function(suffix, isNullOnNull) {
        return function(str) {
            var r = isNullOnNull && str == null ? null : str + suffix;
            return r;
        };
    },

    extractAllRegexMatches: function(pattern, str, index) {
        var match;
        var result = [];

        while ((match = pattern.exec(str)) != null) {
            result.push(match[index]);
        }

        result = uniq(result);

        return result;
    },

    /**
     * Returns a function that prepends or appends a given string to its
     * arguments
     *
     * ^ prefix
     * $ suffix
     * null / empty: return argument unchanged
     * exception otherwise
     *
     *
     * @returns
     */
    parseAffixFn: function(arg) {
        var result;
        var type = (arg == null || arg === '') ? '-' : arg.charAt(0);

        var f = type === '^' || type === '$' ? arg.slice(1) : arg;

        switch(type) {
        case '^':
            result = function(str) {
                return f + str;
            };
            break;
        case '$':
            result = function(str) {
                return str + f;
            };
            break;
        default:
            result = function(str) {
                return str;
            };
        }

        return result;
    }


};

module.exports = StringUtils;
