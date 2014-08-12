var Class = require('../../ext/class');
// constructor
var JoinTargetState = Class.create({
    initialize: function(varMap, joinNode, element, elementVars) {
        this.varMap = varMap;
        this.joinNode = joinNode;
        this.element = element;
        this.elementVars = elementVars;

        this.joinInfos = [];
    },

    getVarMap: function() {
        return this.varMap;
    },

    getJoinNode: function() {
        return this.joinNode;
    },

    getElement: function() {
        return this.element;
    },

    getElementVars: function() {
        return this.elementVars;
    },

    getJoinInfos: function() {
        return this.joinInfos;
    },
});

module.exports = JoinTargetState;
