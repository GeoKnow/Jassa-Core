var Class = require('../../ext/Class');

var ConstraintUtils = require('../ConstraintUtils');
var ConstraintBasePathValue = require('./ConstraintBasePathValue');

var ConstraintEquals = Class.create(ConstraintBasePathValue, {
    classLabel: 'jassa.facete.ConstraintEquals',
    
    initialize: function($super, path, node) {
        $super('equals', path, node);
    },
    
    createElementsAndExprs: function(facetNode) {
        var result = ConstraintUtils.createConstraintEquals(facetNode, this.path, this.value);
        return result;
    }
});

module.exports = ConstraintEquals;