'use strict';
var NodeFactory = require('./NodeFactory');
var Nodes = require('./node/Node');
var Triple = require('./triple');

// create new object
var ns = {};
ns.Node = Nodes.Node;
ns.NodeFactory = NodeFactory;
ns.Triple = Triple;

// freeze from modification
Object.freeze(ns);

// export
module.exports = ns;
