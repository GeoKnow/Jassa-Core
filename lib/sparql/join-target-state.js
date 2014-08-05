// constructor
var JoinTargetState = function(varMap, joinNode, element, elementVars) {
    this.initialize(varMap, joinNode, element, elementVars);
};

JoinTargetState.prototype.initialize = function(varMap, joinNode, element, elementVars) {
    this.varMap = varMap;
    this.joinNode = joinNode;
    this.element = element;
    this.elementVars = elementVars;

    this.joinInfos = [];
};

JoinTargetState.prototype.getVarMap = function() {
    return this.varMap;
};

JoinTargetState.prototype.getJoinNode = function() {
    return this.joinNode;
};

JoinTargetState.prototype.getElement = function() {
    return this.element;
};

JoinTargetState.prototype.getElementVars = function() {
    return this.elementVars;
};

JoinTargetState.prototype.getJoinInfos = function() {
    return this.joinInfos;
};

module.exports = JoinTargetState;
