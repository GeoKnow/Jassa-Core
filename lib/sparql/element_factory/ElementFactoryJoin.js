var Class = require('../../ext/Class');
var JoinType = require('../join/JoinType');
var ElementUtils = require('../ElementUtils');
var ElementOptional = require('../element/ElementOptional');
var ElementGroup = require('../element/ElementGroup');
var ElementFactory = require('./ElementFactory');

/**
 * This factory creates an element Based on two elements (a, b) and corresponding join variables.
 *
 * The variables in the first element are retained, whereas those of the
 * second element are renamed as needed.
 *
 * The purpose of this class is to support joining a concept created from faceted search
 * with a sponate sparql element.
 *
 * Example:
 * {?x a Castle} join {?y rdfs:label} on (?x = ?y)
 * after the join, the result will be
 * {?y a Castle . ?y rdfs:label}
 *
 *
 *
 *
 */
var ElementFactoryJoin = Class.create(ElementFactory, {
    initialize: function(elementFactoryA, elementFactoryB, joinVarsA, joinVarsB, joinType) {
        this.elementFactoryA = elementFactoryA;
        this.elementFactoryB = elementFactoryB;
        this.joinVarsA = joinVarsA;
        this.joinVarsB = joinVarsB;
        this.joinType = joinType ? joinType : JoinType.INNER_JOIN;
    },

    createElement: function() {
        var elementA = this.elementFactoryA.createElement();
        var elementB = this.elementFactoryB.createElement();

        var varsA = elementA.getVarsMentioned();
        var varsB = elementB.getVarsMentioned();

        var varMap = ElementUtils.createJoinVarMap(varsB, varsA, this.joinVarsB, this.joinVarsA); // , varNameGenerator);

        elementA = ElementUtils.createRenamedElement(elementA, varMap);

        if (this.joinType === JoinType.LEFT_JOIN) {
            elementB = new ElementOptional(elementB);
        }

        var result = new ElementGroup([
            elementA,
            elementB,
        ]);

        return result;
    },
});

module.exports = ElementFactoryJoin;
