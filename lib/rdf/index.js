'use strict';
var NodeFactory = require('./node-factory');

// create new object
var ns = {};
ns.NodeFactory = NodeFactory;

// freeze from modification
Object.freeze(ns);

// export
module.exports = ns;
