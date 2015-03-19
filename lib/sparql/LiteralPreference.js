var Class = require('../ext/Class');

var rdfs = require('../vocab/rdfs');

/**
 * Preference of literals expressed in terms of languages and predicates
 *
 */
var LiteralPreference = Class.create({
    /**
     * @param predicateFavored True if predicates should be preferred over languages
     */
    initialize: function(langs, predicates, predicateFavored) {
        this.langs = langs || ['en', ''];
        this.predicates = predicates || [rdfs.label];
        this.predicateFavored = !!predicateFavored;
    },

    getLangs: function() {
        return this.langs;
    },

    getPredicates: function() {
        return this.predicates;
    },

    isPredicateFavored: function() {
        return this.predicateFavored;
    },

    toString: function() {
        var result = ['LiteralPreference', this.langs, this.predicates, this.predicateFavored].join(', ');
        return result;
    }
});

module.exports = LiteralPreference;

