'use strict';

var ns = {
    owl: require('./owl'),
    rdf: require('./rdf'),
    rdfs: require('./rdfs'),
    wgs84: require('./wgs84'),
    xsd: require('./xsd'),
    cs: require('./cs'),
    InitialContext: require('./InitialContext')
};

//Object.freeze(ns);

module.exports = ns;

