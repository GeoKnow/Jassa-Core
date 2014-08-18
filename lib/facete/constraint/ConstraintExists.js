var Class = require('../../ext/Class');

var ConstraintUtils = require('../ConstraintUtils');
var ConstraintBasePath = require('./ConstraintBasePath');

var ConstraintExists = Class.create(ConstraintBasePath, {
    classLabel: 'jassa.facete.ConstraintExists',

    initialize: function($super, path) {
        $super('exists', path);
    },
    
    createElementsAndExprs: function(facetNode) {
        var result = ConstraintUtils.createConstraintExists(facetNode, this.path);
        return result;
    },

});

module.exports = ConstraintExists;