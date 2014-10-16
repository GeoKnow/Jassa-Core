/* global describe */
/* global it */
var should = require('should');

var uniq = require('lodash');

// lib includes
var Promise = require('bluebird');
var request = Promise.promisifyAll(require('request'));
var ajax = function(param) {
    return request.postAsync(param.url, {
        json: true,
        form: param.data,
    }).then(function(res) {
        return new Promise(function(resolve) {
            resolve(res[0].body);
        });
    });
};

// lib
var jassa = require('../lib')(Promise, ajax);
// namespaces
var rdf = jassa.rdf;
var vocab = jassa.vocab;
var sparql = jassa.sparql;
var service = jassa.service;
var sponate = jassa.sponate;
var util = jassa.util;
var geo = jassa.geo;

// tests
describe('Geo Tests', function() {

    it('#DataSource test', function() {

        var createSparqlService = function(url, graphUris) {
            var result = new service.SparqlServiceBuilder.http(url, graphUris)
                .cache().virtFix().paginate(1000).create();
            return result;
        };


        var geoMapFactoryVirt = geo.GeoMapFactoryUtils.createWktMapFactory('http://www.w3.org/2003/01/geo/wgs84_pos#geometry', 'bif:st_intersects', 'bif:st_geomFromText');
        var geoMapFactoryAsWktVirt = geo.GeoMapFactoryUtils.createWktMapFactory('http://www.opengis.net/ont/geosparql#asWKT', 'bif:st_intersects', 'bif:st_geomFromText');
        var geoMapFactoryWgs =  geo.GeoMapFactoryUtils.wgs84MapFactory;

        var sparqlServiceA = createSparqlService('http://dbpedia.org/sparql', ['http://dbpedia.org']);
        var sparqlServiceB = createSparqlService('http://linkedgeodata.org/sparql', ['http://linkedgeodata.org']);
        var sparqlServiceC = createSparqlService('http://localhost/data/geolink/sparql', ['http://geolink.aksw.org/']);

        var conceptA = facete.ConceptUtils.createTypeConcept('http://dbpedia.org/ontology/Airport');
        var conceptB = facete.ConceptUtils.createTypeConcept('http://linkedgeodata.org/ontology/Airport');
        var conceptC = facete.ConceptUtils.createTypeConcept('http://www.linklion.org/ontology#Link');

        var createMapDataSource = function(sparqlService, geoMapFactory, concept, fillColor) {

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

            var result = geo.GeoDataSourceUtils.createGeoDataSourceLabels(sparqlService, geoMapFactory, concept, attrs);
            return result;
        }

        var bounds = new geo.Bounds(7.0, 49.0, 9, 51.0);

        var dataSource = createMapDataSource(sparqlServiceA, geoMapFactoryVirt, conceptA, '#CC0020');
        dataSource.fetchData(bounds).then(function(items) {
           console.log('GEO-RESULT: ' + items);
        });

    })

});

