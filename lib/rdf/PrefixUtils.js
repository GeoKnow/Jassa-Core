var PrefixUtils = {
    // A very permissive curie pattern: anything with a colon that does not contain slashes or whitespaces
    permissiveCuriePattern: /^\s*([^:/]+):([^\s/]+)\s*$/,
    prefixPattern: /\s*([^:]+)\s*:\s*([^\s]*)\s*/mg,


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
    parsePrefixes: function(str) {
        var result = {};
        var match;
        while ((match = this.prefixPattern.exec(str)) != null) {
            var ns = match[1];
            var uri = match[2];
            result[ns] = uri;
        }

        return result;
    }
};

module.exports = PrefixUtils;
