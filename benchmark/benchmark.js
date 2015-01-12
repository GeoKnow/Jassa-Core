
// lib includes
var extend = require('xtend');
var Promise = require('bluebird');
var request = Promise.promisifyAll(require('request'));
var ajax = function(param) {
  return request.postAsync(param.url, {
    json: true,
    form: param.data
  }).then(function(res) {
    return new Promise(function(resolve) {
      resolve(res[0].body);
    });
  });
};

// lib
var jassa = require('../lib')(Promise, ajax);

var rdf = jassa.rdf;
var sparql = jassa.sparql;
var service = jassa.service;
var sponate = jassa.sponate;
var facete = jassa.facete;
var util = jassa.util;

var geo = jassa.geo;

var vocab = jassa.vocab;

// test output
console.log(jassa.rdf.NodeFactory.createUri('foo'));

var createMapDataSource = function(sparqlService, geoMapFactory, concept, fillColor, moreAttrs) {

  var attrs = {
    fillColor: fillColor,
    fontColor: fillColor,
    strokeColor: fillColor,

    stroke: true,
    strokeLinecap: 'round',
    strokeWidth: 100,
    pointRadius: 12,
    labelAlign: 'cm'
  };

  var attrs = extend(attrs, moreAttrs);

  var result = geo.GeoDataSourceUtils.createGeoDataSourceLabels(sparqlService, geoMapFactory, concept, attrs);
  return result;
};

var createSparqlService = function(url, graphUris) {
  var result = service.SparqlServiceBuilder.http(url, graphUris, {type: 'POST'})
    .cache().virtFix().paginate(1000).pageExpand(100).create();

  return result;
};

// degrees to radians
var deg2rad = function(degrees) {
  return Math.PI*degrees/180.0;
};

// radians to degrees
var rad2deg = function(radians) {
  return 180.0*radians/Math.PI;
};

// Semi-axes of WGS-84 geoidal reference
var WGS84_a = 6378137.0  // Major semiaxis [m]
var WGS84_b = 6356752.3  // Minor semiaxis [m]

// Earth radius at a given latitude, according to the WGS-84 ellipsoid [m]
var WGS84EarthRadius = function(lat) {
  // http://en.wikipedia.org/wiki/Earth_radius
  var An = WGS84_a*WGS84_a * Math.cos(lat);
  var Bn = WGS84_b*WGS84_b * Math.sin(lat);
  var Ad = WGS84_a * Math.cos(lat);
  var Bd = WGS84_b * Math.sin(lat);
  return Math.sqrt( (An*An + Bn*Bn)/(Ad*Ad + Bd*Bd) );
};

// Bounding box surrounding the point at given coordinates,
// assuming local approximation of Earth surface as a sphere
// of radius given by WGS84
var boundingBox = function(latitudeInDegrees, longitudeInDegrees, halfSideInM) {
  var lat = deg2rad(latitudeInDegrees);
  var lon = deg2rad(longitudeInDegrees);
  var halfSideInKm = halfSideInM/1000;
  var halfSide = 1000*halfSideInKm;

  // Radius of Earth at given latitude
  var radius = WGS84EarthRadius(lat);
  // Radius of the parallel at given latitude
  var pradius = radius*Math.cos(lat);

  var latMin = lat - halfSide/radius;
  var latMax = lat + halfSide/radius;
  var lonMin = lon - halfSide/pradius;
  var lonMax = lon + halfSide/pradius;

  return {
    latMin: rad2deg(latMin),
    lonMin: rad2deg(lonMin),
    latMax: rad2deg(latMax),
    lonMax: rad2deg(lonMax)
  };
};

// DBPEDIA
var BERLIN = {
  lat: 52.516666666666666,
  lon: 13.383333333333333
};

// DBPEDIA
var LEIPZIG = {
  lat: 51.333333333333336,
  lon: 12.383333333333333
};

// coordinates from Leipzig to Berlin
var LEIPZIG_TO_BERLIN = [
  LEIPZIG,
  { lat: 51.48710859375, lon: 12.5151359375 },
  { lat: 51.61894453125, lon: 12.619506054687 },
  { lat: 51.739794140625, lon: 12.723876171875 },
  { lat: 51.871630078125, lon: 12.84472578125 },
  { lat: 51.995226269531, lon: 12.949095898437 },
  { lat: 52.110582714844, lon: 13.0424796875 },
  { lat: 52.209459667969, lon: 13.135863476562 },
  { lat: 52.324816113281, lon: 13.229247265625 },
  { lat: 52.401720410156, lon: 13.295165234375 },
  { lat: 52.492357617188, lon: 13.37206953125 },
  BERLIN
];

// compute bounds in a 1000km radius of Leipzig
var boundsLeipzig = boundingBox(LEIPZIG.lat, LEIPZIG.lon, 1000000);
// OUTPUT
// {
//   latMin: 42.33184174508855,
//   lonMin: -2.0239282899298066,
//   latMax: 60.33482492157812,
//   lonMax: 26.790594956596475
// }

console.log('bounding box for Leipzig', boundsLeipzig);

var sparqlServiceA = createSparqlService('http://akswnc3.informatik.uni-leipzig.de/data/dbpedia/sparql', ['http://dbpedia.org']);
var geoMapFactoryVirt = geo.GeoMapFactoryUtils.createWktMapFactory('http://www.w3.org/2003/01/geo/wgs84_pos#geometry', 'bif:st_intersects', 'bif:st_geomFromText');
var conceptA = sparql.ConceptUtils.createTypeConcept('http://dbpedia.org/ontology/University');

var bounds = new geo.Bounds(-180, -180, 180, 180);

var dataSource = createMapDataSource(sparqlServiceA, geoMapFactoryVirt, conceptA, '#CC0020');

console.log('createMapDataSource', dataSource);

dataSource.fetchData(bounds).then(function(items) {
  var clusterCount = 0;
  var instanceCount = 0;
  console.log('items', items);
  items.forEach(function(item) {
    if(item.zoomClusterBounds) {
      clusterCount++;
    } else {
      instanceCount++;
    }

  });

  console.log('clusterCount', clusterCount);
  console.log('instanceCount', instanceCount);
});


