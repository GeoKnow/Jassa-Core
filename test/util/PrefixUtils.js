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
});