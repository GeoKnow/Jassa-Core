'use strict';
var NodeFactory = require('./node-factory');
var Nodes = require('./node');
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
