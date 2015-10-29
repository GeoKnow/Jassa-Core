var Concept = require('../sparql/Concept');
var ElementString = require('../sparql/element/ElementString');
var VarUtils = require('../sparql/VarUtils');

var GeoConceptUtils = {
    conceptWgs84: new Concept(ElementString.create('?s <http://www.w3.org/2003/01/geo/wgs84_pos#long> ?x ;  <http://www.w3.org/2003/01/geo/wgs84_pos#lat> ?y'), VarUtils.s),
    conceptGeoVocab:  new Concept(ElementString.create('?s <http://www.opengis.net/ont/geosparql#asWKT> ?w'), VarUtils.s),
    conceptSchemaOrgGeoCoordinate: new Concept(ElementString.create('?s <http://schema.org/longitude> ?x ;  <http://schema.org/latitude> ?y'), VarUtils.s)
};

module.exports = GeoConceptUtils;
