var Class = require('../../ext/class');
var JoinType = require('../join/join-type');
var JoinBuilderElement = require('../join/join-builder-element');
var ElementFactory = require('./element-factory');
var ElementGroup = require('./element-group');

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

        var rootJoinNode = JoinBuilderElement.create(elementA);
        var joinNode = rootJoinNode.joinAny(this.joinType, joinVarsA, elementB, joinVarsB);

        var joinBuilder = joinNode.getJoinBuilder();
        var elements = joinBuilder.getElements();
        var result = new ElementGroup(elements);

        return result;
    },
});

module.exports = ElementFactoryJoinConcept;
