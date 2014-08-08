var Class = require('../ext/class');
// constructor
var JoinNodeInfo = Class.create({
    initialize: function(joinNode, joinType) {
        this.joinNode = joinNode;
        this.joinType = joinType;
    },

    getJoinNode: function() {
        return this.joinNode;
    },

    getJoinType: function() {
        return this.joinType;
    },

    toString: function() {
        return this.joinType + ' ' + this.joinNode;
    },
});

module.exports = JoinNodeInfo;