// constructor
var JoinNodeInfo = function(joinNode, joinType) {
    this.initialize(joinNode, joinType);
};

JoinNodeInfo.prototype.initialize = function(joinNode, joinType) {
    this.joinNode = joinNode;
    this.joinType = joinType;
};

JoinNodeInfo.prototype.getJoinNode = function() {
    return this.joinNode;
};

JoinNodeInfo.prototype.getJoinType = function() {
    return this.joinType;
};

JoinNodeInfo.prototype.toString = function() {
    return this.joinType + ' ' + this.joinNode;
};

module.exports = JoinNodeInfo;
