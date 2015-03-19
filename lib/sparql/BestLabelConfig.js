var Class = require('../ext/Class');

var VarUtils = require('./VarUtils');

var LiteralPreference = require('./LiteralPreference');
/**
 * TODO: Consider using LiteralPreference instead of this class
 *
 * This class augments a literalPreference with variables
 */
var BestLabelConfig = Class.create({
    /*
    initialize: function(langs, predicates, objectVar, subjectVar, predicateVar) {
        this.langs = langs || ['en', ''];
        this.predicates = predicates || [rdfs.label];
        this.subjectVar = subjectVar || VarUtils.x;
        this.predicateVar = predicateVar || VarUtils.y;
        this.objectVar = objectVar || VarUtils.z;
    },

    getLangs: function() {
        return this.langs;
    },

    getPredicates: function() {
        return this.predicates;
    },
    */

    initialize: function(literalPreference, objectVar, subjectVar, predicateVar) {
        this.literalPreference = literalPreference || new LiteralPreference();
        this.subjectVar = subjectVar || VarUtils.x;
        this.predicateVar = predicateVar || VarUtils.y;
        this.objectVar = objectVar || VarUtils.z;
    },

    /**
     * Convenience method
     *
     */
    getLangs: function() {
        var result = this.literalPreference.getLangs();
        return result;
    },

    /**
     * Convenience method
     *
     */
    getPredicates: function() {
        var result = this.literalPreference.getPredicates();
        return result;
    },

    getLiteralPreference: function() {
        return this.literalPrefence;
    },

    getSubjectVar: function() {
        return this.subjectVar;
    },

    getPredicateVar: function() {
        return this.predicateVar;
    },

    getObjectVar: function() {
        return this.objectVar;
    },

    toString: function() {
        var result = ['BestLabelConfig', this.langs, this.predicates, this.subjectVar, this.predicateVar, this.objectVar].join(', ');
        return result;
    }
});

module.exports = BestLabelConfig;

