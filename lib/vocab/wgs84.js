var NodeFactory = require('../rdf/NodeFactory');
var p = 'http://www.w3.org/2003/01/geo/wgs84_pos#';

// String versions
var ns = {
    lon: NodeFactory.createUri(p + 'long'),
    lat: NodeFactory.createUri(p + 'lat'),
};

module.exports = ns;
