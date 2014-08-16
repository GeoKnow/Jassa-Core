var Class = require('../../ext/Class');
var JoinType = require('../join/JoinType');
var JoinBuilder = require('../join/JoinBuilder');
var ElementGroup = require('../element/ElementGroup');
var ElementFactory = require('./ElementFactory');

/**
 * Variables of conceptB are renamed
 *
 */
var ElementFactoryJoinConcept = Class.create(ElementFactory, {
    initialize: function(conceptFactoryA, conceptFactoryB, joinType) {
        this.conceptFactoryA = conceptFactoryA;
        this.conceptFactoryB = conceptFactoryB;
        this.joinType = joinType || JoinType.INNER_JOIN;
    },

    createElement: function() {
        var conceptA = this.conceptFactoryA.createConcept();
        var conceptB = this.conceptFactoryB.createConcept();

        var elementA = conceptA.getElement();
        var elementB = conceptB.getElement();

        if (conceptB.isSubjectConcept()) {
            return elementA;
        }

        var joinVarsA = [
            conceptA.getVar(),
        ];
        var joinVarsB = [
            conceptB.getVar(),
        ];

        var rootJoinNode = JoinBuilder.create(elementA);
        var joinNode = rootJoinNode.joinAny(this.joinType, joinVarsA, elementB, joinVarsB);

        var joinBuilder = joinNode.getJoinBuilder();
        var elements = joinBuilder.getElements();
        var result = new ElementGroup(elements);

        return result;
    },
});

module.exports = ElementFactoryJoinConcept;
