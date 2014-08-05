var JoinType = require('./join-type');
var JoinNode = require('./join-node');
var JoinNodeInfo = require('./join-node-info');
var JoinInfo = require('./join-info');
var JoinTargetState = require('./join-target-state');
var JoinBuilderElement = require('./join-builder-element');
var JoinBuilderUtils = require('./join-builder-utils');

// object
var ns = {};

ns.JoinType = JoinType;

/**
 * A convenient facade on top of a join builder
 * 
 */
ns.JoinNode = JoinNode;

/**
 * 
 * 
 */
ns.JoinNodeInfo = JoinNodeInfo;

/**
 * This object just holds information
 * about the join type of a referred alias. 
 * 
 */
ns.JoinInfo = JoinInfo;
ns.JoinTargetState = JoinTargetState;


/**
 * Aliases are automatically assigned if none is given explicitly
 * 
 * The alias can be retrieved using
 * joinNode.getAlias();
 * 
 * 
 * a: castle
 * 
 * 
 * b: owners
 * 
 * 
 */
ns.JoinBuilderElement = JoinBuilderElement;
ns.JoinBuilderUtils = JoinBuilderUtils;

module.exports = ns;