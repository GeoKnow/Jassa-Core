var Class = require('../ext/class');

// constructor
var JoinInfo = Class.create({
    initialize: function(alias, joinType) {
        this.alias = alias;
        this.joinType = joinType;
    },

    getAlias: function() {
        return this.alias;
    },

    getJoinType: function() {
        return this.joinType;
    },

    toString: function() {
        return this.joinType + ' ' + this.alias;
    },
});

module.exports = JoinInfo;