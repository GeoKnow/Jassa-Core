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
var jassa = require('../../lib/index')(Promise, ajax);
// namespaces
var rdf = jassa.rdf;
var vocab = jassa.vocab;
var sparql = jassa.sparql;
var service = jassa.service;

var LiteralLabel = require('../../lib/rdf/LiteralLabel');
var TypedValue = require('../../lib/rdf/rdf_datatype/TypedValue');
var BaseDatatype = require('../../lib/rdf/rdf_datatype/BaseDatatype');

describe('Literal label', function() {
  it('should initialize and serialize correctly with dtype', function() {
    var lex = 23;
    var dtypeURI = 'http://www.w3.org/2001/XMLSchema#int';
    var typedValue = new TypedValue(lex, dtypeURI);
    var dtype = new BaseDatatype(dtypeURI);

    var litLabel = new LiteralLabel(typedValue, lex, null, dtype);

    litLabel.getValue().should.equal(typedValue);
    litLabel.getLexicalForm().should.equal(lex);
    (litLabel.getLanguage() === null).should.be.true;
    litLabel.getDatatype().should.equal(dtype);
    litLabel.toString().should.equal('"' + lex + '"^^<' + dtypeURI + '>');
  });

  it('should initialize and serialize correctly with language tag', function() {
    var lex, val;
    lex = val = 'foo';
    var lang = 'en';
    var litLabel = new LiteralLabel(val, lex, lang, null);

    litLabel.getValue().should.equal(val);
    litLabel.getLexicalForm().should.equal(lex);
    litLabel.getLanguage().should.equal(lang);
    (litLabel.getDatatype() === null).should.be.true;
    // TODO: add escapeLiteralString check when escapeLiteralString is implemented
    litLabel.toString().should.equal('"' + lex + '"@' + lang + '');
  });

  it('should initialize and serialize correctly without dtype or ' +
      'language tag', function() {
    var lex, val;
    lex = val = 'foo';
    var litLabel = new LiteralLabel(val, lex, null, null);

    litLabel.getValue().should.equal(val);
    litLabel.getLexicalForm().should.equal(lex);
    (litLabel.getLanguage() === null).should.be.true;
    (litLabel.getDatatype() === null).should.be.true;
    // TODO: add escapeLiteralString check when escapeLiteralString is implemented
    litLabel.toString().should.equal('"' + lex + '"');
  })
});