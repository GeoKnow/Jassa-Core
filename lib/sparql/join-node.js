var JoinNodeInfo = require('./join-node-info');
var JoinType = require('./join-type');

// constructor
var JoinNode = function(joinBuilder, alias, targetJoinVars) {
    this.initialize(joinBuilder, alias, targetJoinVars);
};

JoinNode.prototype.initialize = function(joinBuilder, alias, targetJoinVars) {
    this.joinBuilder = joinBuilder;
    this.alias = alias;
    this.targetJoinVars = targetJoinVars;
};

JoinNode.prototype.getJoinBuilder = function() {
    return this.joinBuilder;
};

/**
 * Returns the variables on which this node is joined to the parent
 *
 * For the root node, this is the set of default vars on which joins
 * can be performed
 *
 */
JoinNode.prototype.getJoinVars = function() {
    return this.targetJoinVars;
};

JoinNode.prototype.getElement = function() {
    return this.joinBuilder.getElement(this.alias);
};

JoinNode.prototype.getVarMap = function() {
    return this.joinBuilder.getVarMap(this.alias);
};

// Returns all join node object 
// joinBuilder = new joinBuilder();
// node = joinBuilder.getRootNode();
// node.join([?s], element, [?o]);
//    ?s refers to the original element wrapped by the node
//    ?o also refers to the original element of 'element'
// 
// joinBuilder.getRowMapper();
// joinBuilder.getElement();
// TODO: Result must include joinType
JoinNode.prototype.getJoinNodeInfos = function() {
    var state = this.joinBuilder.getState(this.alias);

    var self = this;
    var result = state.getJoinInfos().map(function(joinInfo) {
        var alias = joinInfo.getAlias();
        var targetJoinNode = self.joinBuilder.getJoinNode(alias);

        var r = new JoinNodeInfo(targetJoinNode, joinInfo.getJoinType());
        return r;
    });

    return result;
};

JoinNode.prototype.joinAny = function(joinType, sourceJoinVars, targetElement, targetJoinVars, targetAlias) {
    var result = this.joinBuilder.addJoin(joinType, this.alias, sourceJoinVars, targetElement, targetJoinVars, targetAlias);

    return result;
};

JoinNode.prototype.join = function(sourceJoinVars, targetElement, targetJoinVars, targetAlias) {
    var result = this.joinAny(JoinType.INNER_JOIN, sourceJoinVars, targetElement, targetJoinVars, targetAlias);
    return result;
};

JoinNode.prototype.leftJoin = function(sourceJoinVars, targetElement, targetJoinVars, targetAlias) {
    var result = this.joinAny(JoinType.LEFT_JOIN, sourceJoinVars, targetElement, targetJoinVars, targetAlias);
    return result;
};

JoinNode.prototype.joinTree = function() {
};
JoinNode.prototype.leftJoinTree = function() {
};
JoinNode.prototype.joinTreeAny = function() {
};

module.exports = JoinNode;
