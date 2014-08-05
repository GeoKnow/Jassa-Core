// constructor
var JoinInfo = function(alias, joinType) {
    this.initialize(alias, joinType);
};

JoinInfo.prototype.initialize = function(alias, joinType) {
    this.alias = alias;
    this.joinType = joinType;
};
   
JoinInfo.prototype.getAlias = function() {
    return this.alias;
};
   
JoinInfo.prototype.getJoinType = function() {
    return this.joinType;
};
   
JoinInfo.prototype.toString = function() {
    return this.joinType + ' ' + this.alias;
};

module.exports = JoinInfo;
