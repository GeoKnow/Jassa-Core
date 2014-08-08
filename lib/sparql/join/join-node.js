var Class = require('../../ext/class');
var JoinNodeInfo = require('./join-node-info');
var JoinType = require('./join-type');

// constructor
var JoinNode = Class.create({
    initialize: function(joinBuilder, alias, targetJoinVars) {
        this.joinBuilder = joinBuilder;
        this.alias = alias;
        this.targetJoinVars = targetJoinVars;
    },

    getJoinBuilder: function() {
        return this.joinBuilder;
    },

    /**
     * Returns the variables on which this node is joined to the parent
     *
     * For the root node, this is the set of default vars on which joins
     * can be performed
     *
     */
    getJoinVars: function() {
        return this.targetJoinVars;
    },

    getElement: function() {
        return this.joinBuilder.getElement(this.alias);
    },

    getVarMap: function() {
        return this.joinBuilder.getVarMap(this.alias);
    },

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
    getJoinNodeInfos: function() {
        var state = this.joinBuilder.getState(this.alias);

        var self = this;
        var result = state.getJoinInfos().map(function(joinInfo) {
            var alias = joinInfo.getAlias();
            var targetJoinNode = self.joinBuilder.getJoinNode(alias);

            var r = new JoinNodeInfo(targetJoinNode, joinInfo.getJoinType());
            return r;
        });

        return result;
    },

    joinAny: function(joinType, sourceJoinVars, targetElement, targetJoinVars, targetAlias) {
        var result = this.joinBuilder.addJoin(joinType, this.alias, sourceJoinVars, targetElement, targetJoinVars, targetAlias);

        return result;
    },

    join: function(sourceJoinVars, targetElement, targetJoinVars, targetAlias) {
        var result = this.joinAny(JoinType.INNER_JOIN, sourceJoinVars, targetElement, targetJoinVars, targetAlias);
        return result;
    },

    leftJoin: function(sourceJoinVars, targetElement, targetJoinVars, targetAlias) {
        var result = this.joinAny(JoinType.LEFT_JOIN, sourceJoinVars, targetElement, targetJoinVars, targetAlias);
        return result;
    },

    joinTree: function() {},
    leftJoinTree: function() {},
    joinTreeAny: function() {},
});

module.exports = JoinNode;