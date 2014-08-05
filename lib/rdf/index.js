'use strict';
// as test require all files in the folder
require('fs').readdirSync('./lib/rdf').forEach(function(file) {
    if(file.indexOf('.js') !== -1) {
        require('./' + file);
    }
});

var NodeFactory = require('./node-factory');

// create new object
var ns = {};
ns.NodeFactory = NodeFactory;

// freeze from modification
Object.freeze(ns);

// export
module.exports = ns;
