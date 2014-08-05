var JoinType = require('./join-type');
var JoinBuilderElement = require('./join-builder-element');
var ElementFactory = require('./element-factory');
var ElementGroup = require('./element-group');

/**
 * Variables of conceptB are renamed
 * 
 */
var ElementFactoryJoinConcept = function(conceptFactoryA, conceptFactoryB, joinType) {
    ElementFactory.call(this);

    this.initialize(conceptFactoryA, conceptFactoryB, joinType);
};


// inherit
ElementFactoryJoinConcept.prototype = Object.create(ElementFactory.prototype);
// hand back the constructor
ElementFactoryJoinConcept.prototype.constructor = ElementFactoryJoinConcept;


ElementFactoryJoinConcept.prototype.initialize = function(conceptFactoryA, conceptFactoryB, joinType) {
    this.conceptFactoryA = conceptFactoryA;
    this.conceptFactoryB = conceptFactoryB;
    this.joinType = joinType || JoinType.INNER_JOIN;
};

ElementFactoryJoinConcept.prototype.createElement = function() {

    var conceptA = this.conceptFactoryA.createConcept();
    var conceptB = this.conceptFactoryB.createConcept();
    
    var elementA = conceptA.getElement();
    var elementB = conceptB.getElement();
    
    if(conceptB.isSubjectConcept()) {
        return elementA;
    }
    
    var joinVarsA = [conceptA.getVar()];
    var joinVarsB = [conceptB.getVar()];
    
    var rootJoinNode = JoinBuilderElement.create(elementA);
    var joinNode = rootJoinNode.joinAny(this.joinType, joinVarsA, elementB, joinVarsB);

    var joinBuilder = joinNode.getJoinBuilder();
    var elements = joinBuilder.getElements();
    var result = new ElementGroup(elements);
    
    return result;
};

module.exports = ElementFactoryJoinConcept;
