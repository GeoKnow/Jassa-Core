var should = require('should');

// lib includes
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
var jassa = require('../../lib')(Promise, ajax);
// namespaces
var rdf = jassa.rdf;
var vocab = jassa.vocab;
var sparql = jassa.sparql;
var service = jassa.service;

var PrefixMappingImpl = require('../../lib/rdf/PrefixMappingImpl');

describe('PrefixMappingImpl', function() {

  var prefixMap = {
    'xsd': 'http://www.w3.org/2001/XMLSchema#',
    'rdf': 'http://www.w3.org/1999/02/22-rdf-syntax-ns#',
    'rdfs': 'http://www.w3.org/2000/01/rdf-schema#',
    'owl': 'http://www.w3.org/2002/07/owl#'
  };
  var prefixMapping = new PrefixMappingImpl(prefixMap);

  it('should correctly expand a prefix', function() {
    var uri = prefixMapping.expandPrefix('rdf:type');
    uri.should.equal('http://www.w3.org/1999/02/22-rdf-syntax-ns#type');
  });

  it('should correctly return the name uri', function() {
    var uri = prefixMapping.expandPrefix('http://www.w3.org/1999/02/22-rdf-syntax-ns#type');
    uri.should.equal('http://www.w3.org/1999/02/22-rdf-syntax-ns#type');
  });



  it('should return its prefix map correctly', function() {  // ...a really hard job...
    var resPrefixMap = prefixMapping.getNsPrefixMap();
    resPrefixMap.should.equal(prefixMap);
  });

  it('should return a prefix\'s correct URI', function() {
    var prefix = 'rdf';
    var uri = prefixMapping.getNsPrefixURI(prefix);

    uri.should.equal(prefixMap[prefix]);
  });

  it('should return the correct prefix of a given URI', function() {
    var prefix = 'rdfs';
    var uri = prefixMap[prefix];
    var resPrefix = prefixMapping.getNsURIPrefix(uri);
    resPrefix.should.equal(prefix);
  });

  it('should return the best matching prefix for a given URI', function() {
    var uri = 'http://www.w3.org/2002/07/owl#Thing';
    var expctdNs = 'owl';
    var resPrefix = prefixMapping.getNsURIPrefix(uri);
    resPrefix.should.equal(expctdNs);
  });

  it('should remove a given prefix mapping correctly', function() {
    var prefix = 'rdfs';
    prefixMapping.removeNsPrefix(prefix);
    var resNs = prefixMap[prefix];
    (resNs === undefined).should.be.true;
  });

  it('should set new prefix mappings correctly', function() {
    var prefix = 'foaf';
    var ns = 'http://xmlns.com/foaf/0.1/';
    prefixMapping.setNsPrefix(prefix, ns);
    prefixMap.hasOwnProperty(prefix).should.be.true;
    var setNs = prefixMap[prefix];
    setNs.should.equal(ns);
  });

  it('should set multiple new prefix mappings correctly', function() {
    var newPrefixes = {
      'dc': 'http://purl.org/dc/elements/1.1/',
      'skos': 'http://www.w3.org/2004/02/skos/core#',
      'geo': 'http://www.w3.org/2003/01/geo/wgs84_pos#'
    };
    prefixMapping.setNsPrefixes(newPrefixes);

    prefixMap.hasOwnProperty('dc').should.be.true;
    prefixMap.hasOwnProperty('skos').should.be.true;
    prefixMap.hasOwnProperty('geo').should.be.true;

    ['dc', 'skos', 'geo'].forEach(function(prefix) {
      prefixMap[prefix].should.equal(newPrefixes[prefix]);
    });
  });

  it('should generate correct qualified names', function() {
    var uri = 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type';
    var expctdQName = 'rdf:type';
    var resQName = prefixMapping.shortForm(uri);

    resQName.should.equal(expctdQName);
  });

  it('should add new prefixes correctly', function() {
    var prefix = 'sioc';
    var ns = 'http://rdfs.org/sioc/ns#';
    prefixMapping.addPrefix(prefix, ns);

    prefixMap.hasOwnProperty(prefix).should.be.true;
    var addedNs = prefixMap[prefix];
    addedNs.should.equal(ns);
  });

  it('should return the correct namespace of a given prefix', function() {
    var prefix = 'owl';
    var resNs = prefixMapping.getPrefix(prefix);

    resNs.should.equal(prefixMap[prefix]);
  });

  it('should add prefixes given as JSON correctly', function() {
    var json = {
      dcterms: 'http://purl.org/dc/terms/',
      dbpedia: 'http://dbpedia.org/resource/',
      cyc: 'http://sw.opencyc.org/concept/'
    };
    prefixMapping.addJson(json);

    prefixMap.hasOwnProperty('dcterms').should.be.true;
    prefixMap.hasOwnProperty('dbpedia').should.be.true;
    prefixMap.hasOwnProperty('cyc').should.be.true;

    ['dcterms', 'dbpedia', 'cyc'].forEach(function(prefix) {
      prefixMap[prefix].should.equal(json[prefix]);
    });
  });

  it('should return the correct prefix map', function() {
    prefixMapping.getJson().should.equal(prefixMap);
  });
});