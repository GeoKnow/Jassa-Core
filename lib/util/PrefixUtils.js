var StringUtils = require('./StringUtils');

var PrefixUtils = {

    // TODO Maybe use the permissive pattern instead?
    prefixPattern: /((\w|-)+):(\w|-)+/g, // TODO Will break if this pattern occurs within a string

    // This method extracts all curies from a string
    extractPrefixes: function(str) {
        var result = StringUtils.extractAllRegexMatches(this.prefixPattern, str, 1);
        return result;
    },

    /**
     * Returns a new string with prefixes expanded
     */
    expandPrefixes: function(prefixes, str) {
        var usedPrefixes = this.extractPrefixes(str);


        var result = str;
        usedPrefixes.forEach(function(prefix) {
            var url = prefixes[prefix];
            if(url) {
                // TODO Add a cache
                var re = new RegExp(prefix + ':(\\w+)', 'g');

                result = result.replace(re, '<' + url + '$1>');
            }
        });

        return result;
    },

    // A very permissive curie pattern: anything with a colon that does not contain slashes, colons or whitespaces
    permissiveCuriePattern: /^\s*([^:/]+):([^\s/:]+)\s*$/,
    permissivePrefixPattern: /\s*([^:]+)\s*:\s*([^\s]*)\s*/mg,


    parseCurie: function(str) {
        var match = this.permissiveCuriePattern.exec(str);
        var result = match ? {key: match[1], val: match[2]} : null;

        return result;
    },

    /**
     * Parses a prefix string and returns an object with a mapping
     * from prefix to namespace
     *
     * @param str
     */
    parsePrefixDecls: function(str) {
        var result = {};
        var match;
        while ((match = this.permissivePrefixPattern.exec(str)) != null) {
            var ns = match[1];
            var uri = match[2];
            result[ns] = uri;
        }

        return result;
    }

};

module.exports = PrefixUtils;
