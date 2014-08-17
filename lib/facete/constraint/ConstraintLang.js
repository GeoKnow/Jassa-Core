var Class = require('../../ext/Class');

var ConstraintUtils = require('../ConstraintUtils');
var ConstraintBasePathValue = require('./ConstraintBasePathValue');

var ConstraintLang = Class.create(ConstraintBasePathValue, {
    classLabel: 'jassa.facete.ConstraintLang',
    
    initialize: function($super, path, langStr) {
        $super('lang', path, langStr);
    },
    
    createElementsAndExprs: function(facetNode) {
        var result = ConstraintUtils.createConstraintLang(facetNode, this.path, this.value);
        return result;
    }
});

module.exports = ConstraintLang;