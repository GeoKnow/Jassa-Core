var Class = require('../ext/Class');

var BestLiteralConfig = Class.create({
    initialize: function(labelPrios, prefLangs, labelExpr, subjectExpr, propertyExpr) {
        this.labelPrios = labelPrios; // TODO Get defaults from global settings
        this.prefLangs = prefLangs; // TODO Get defaults from global settings
        this.labelExpr = labelExpr;
        this.subjectExpr = subjectExpr;
        this.propertyExpr = propertyExpr;
    },
    
    getLabelPrios: function() {
        return this.labelPrios;
    },
    
    getPrefLangs: function() {
        return this.prefLangs;
    },
    
    getLabelExpr: function() {
        return this.labelExpr;
    },
    
    getSubjectExpr: function() {
        return this.propertyExpr;
    },
    
    getPropertyExpr: function() {
        return this.propertyExpr;
    },

});

module.exports = BestLiteralConfig;

