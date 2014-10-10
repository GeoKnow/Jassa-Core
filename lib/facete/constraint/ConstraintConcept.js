var Class = require('../../ext/Class');

var ConstraintUtils = require('../ConstraintUtils');
var ConstraintBasePath = require('./ConstraintBasePath');

var ObjectUtils = require('../../util/ObjectUtils');

var ConstraintConcept = Class.create(ConstraintBasePath, {
    classLabel: 'jassa.facete.ConstraintConcept',

    initialize: function($super, path, concept) {
        $super('concept', path);
        this.concept = concept;
    },

    createElementsAndExprs: function(facetNode) {
        var result = ConstraintUtils.createConstraintConcept(facetNode, this.path, this.concept);
        return result;
    },

    equals: function(other) {
        var result = other && this.path.equals(other.path) && ('' + this.concept === '' + other.concept);
        return result;
    },

    hashCode: function() {
        var result = ObjectUtils.hashCode(this, true);
        return result;
    }

});

module.exports = ConstraintConcept;