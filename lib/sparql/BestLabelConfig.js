var Class = require('../ext/Class');

var rdfs = require('../vocab/rdfs');
var VarUtils = require('./VarUtils');

var BestLabelConfig = Class.create({
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

