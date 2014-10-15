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

var UriUtils = require('../../lib/util/UriUtils');

describe('UriUtils', function() {
  it('should extract labels from a given URI correctly', function() {
    var uriStr1 = 'http://ex.org/foo/bar';
    var expctdLbl1 = 'bar';
    UriUtils.extractLabel(uriStr1).should.equal(expctdLbl1);

    var uriStr2 = 'http://ex.org/foo/bar#baz';
    var expctdLbl2 = 'baz';
    UriUtils.extractLabel(uriStr2).should.equal(expctdLbl2);

    var uriStr3 = 'http://ex.org/';
    UriUtils.extractLabel(uriStr3).should.equal(uriStr3);
  });
});