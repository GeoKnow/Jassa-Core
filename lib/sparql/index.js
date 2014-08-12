var ElementTriplesBlock = require('./element/element-triples-block');
var JoinType = require('./join/join-type');
var JoinNode = require('./join/join-node');
var JoinNodeInfo = require('./join/join-node-info');
var JoinInfo = require('./join/join-info');
var JoinTargetState = require('./join/join-target-state');
var JoinBuilderElement = require('./join/join-builder-element');
var JoinBuilderUtils = require('./join/join-builder-utils');
var Query = require('./query');

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

// expose
ns.ElementTriplesBlock = ElementTriplesBlock;
ns.Query = Query;

module.exports = ns;
