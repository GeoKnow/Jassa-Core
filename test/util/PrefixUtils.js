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

var PrefixUtils = require('../../lib/util/PrefixUtils');

describe('PrefixUtils', function() {
  // extractPrefixes
  it('should extract prefixes correctly', function() {
    var qualifiedName1 = 'ex:sth123';
    var prefix = 'ex';
    PrefixUtils.extractPrefixes(qualifiedName1).should.eql([prefix]);

    var qualifiedName2 = ':sth123';
    PrefixUtils.extractPrefixes(qualifiedName2).should.eql([]);

    var qualifiedName3 = 'ex:123';
    PrefixUtils.extractPrefixes(qualifiedName3).should.eql([prefix]);

    var qualifiedName4 = 'ex:_123';
    PrefixUtils.extractPrefixes(qualifiedName4).should.eql([prefix]);

    var qualifiedName5 = 'ex:-123';
    PrefixUtils.extractPrefixes(qualifiedName5).should.eql([prefix]);
  });

  // expandPrefixes
  it('should expand prefixes correctly', function() {
    var prefixMappings = {
      'rdf': 'http://www.w3.org/1999/02/22-rdf-syntax-ns#',
      'dbpedia-owl': 'http://dbpedia.org/ontology/',
      'foaf': 'http://xmlns.com/foaf/0.1/',
      'ex': 'http://ex.org/',
      'dcat': 'http://www.w3.org/ns/dcat#'
    };

    var qualifiedName1 = 'ex:sth';
    var expctdURI1 = '<http://ex.org/sth>';
    PrefixUtils.expandPrefixes(prefixMappings, qualifiedName1).should.equal(expctdURI1);

    var qualifiedName2 = 'rdf:type';
    var expctdURI2 = '<http://www.w3.org/1999/02/22-rdf-syntax-ns#type>';
    PrefixUtils.expandPrefixes(prefixMappings, qualifiedName2).should.equal(expctdURI2);

    var qualifiedName3 = 'unknwn:sth';
    PrefixUtils.expandPrefixes(prefixMappings, qualifiedName3).should.equal(qualifiedName3);
  });

  // parseCurie
  it('should parse CURIEs correctly', function() {
    // CURIE examples taken from http://www.w3.org/TR/2010/NOTE-curie-20101216
    var curie1 = 'home:#start';
    var expctdRes1 = {key: 'home', 'val': '#start'};
    var curie2 = 'joseki:';
    var expctdRes2 = {key: 'joseki', val: ''};
    var curie3 = "google:xforms+or+'xml+forms'";
    var expctdRes3 = {key: 'google', val: "xforms+or+'xml+forms'"};

    PrefixUtils.parseCurie(curie1).should.eql(expctdRes1);
    PrefixUtils.parseCurie(curie2).should.eql(expctdRes2);
    PrefixUtils.parseCurie(curie3).should.eql(expctdRes3);
  });

  // parsePrefixDecls
  it('should parse prefix declaration strings correctly', function() {
    var prfxDeclStr1 = 'ns: namespace';
    var expctdPrfxDecl1 = {ns: 'namespace'};
    var prfxDeclStr2 = 'f: foo b:bar bz: baz';
    var expctdPrfxDecl2 = {f: 'foo', b: 'bar', bz: 'baz'};
    var prfxDeclStr3 = '';
    var expctdPrfxDecl3 = {};
    var prfxDeclStr4 = 'this is not a prefix declation';
    var expctdPrfxDecl4 = {};

    PrefixUtils.parsePrefixDecls(prfxDeclStr1).should.eql(expctdPrfxDecl1);
    PrefixUtils.parsePrefixDecls(prfxDeclStr2).should.eql(expctdPrfxDecl2);
    PrefixUtils.parsePrefixDecls(prfxDeclStr3).should.eql(expctdPrfxDecl3);
    PrefixUtils.parsePrefixDecls(prfxDeclStr4).should.eql(expctdPrfxDecl4);
  })
});