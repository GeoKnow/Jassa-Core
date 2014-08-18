var Class = require('../../ext/Class');

var ConstraintUtils = require('../ConstraintUtils');
var ConstraintBasePathValue = require('./ConstraintBasePathValue');


var ConstraintRegex = Class.create(ConstraintBasePathValue, {
    classLabel: 'jassa.facete.ConstraintRegex',
    
    initialize: function($super, path, regexStr) {
        $super('regex', path, regexStr);
    },
    
    createElementsAndExprs: function(facetNode) {
        var result = ConstraintUtils.createConstraintRegex(facetNode, this.path, this.value.getLiteralLexicalForm());
        return result;
    }
});

module.exports = ConstraintRegex;
