var StringUtils = require('./StringUtils');

var PrefixUtils = {

    prefixPattern: /((\w|-)+):(\w|-)+/g, // TODO Will break if this pattern occurs within a string

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
    }

};

module.exports = PrefixUtils;
