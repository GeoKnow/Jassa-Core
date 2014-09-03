var Class = require('../../ext/Class');

var ConstraintUtils = require('../ConstraintUtils');
var ConstraintBasePath = require('./ConstraintBasePath');

var ConstraintConcept = Class.create(ConstraintBasePath, {
    classLabel: 'jassa.facete.ConstraintConcept',

    initialize: function($super, path, concept) {
        $super('concept', path);
        this.concept = concept;
    },

    createElementsAndExprs: function(facetNode) {
        var result = ConstraintUtils.createConstraintConcept(facetNode, this.path, this.concept);
        return result;
    }
});

module.exports = ConstraintConcept;