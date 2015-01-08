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

var SerializationContext = require('../../lib/util/SerializationContext');

describe('SerializationContext', function() {

  // nextId
  it('should return the next id correctly', function() {
    var sc = new SerializationContext();
    sc.nextId().should.equal('1');

    var nextIdToCheck = 1234;
    var counter = 2;
    while (counter < nextIdToCheck) {
      sc.nextId();
      counter++;
    }
    sc.nextId().should.equal(nextIdToCheck.toString());
  });

  // getIdToState
  it('should return the idToState attribute correctly', function() {
    var sc = new SerializationContext();
    sc.getIdToState().should.eql({});

    sc.idToState = {foo: 'bar'};
    sc.getIdToState().should.eql({foo: 'bar'});
  });

  // getObjToId
  it('should return the objTiId attribute correctly', function() {
    var sc = new SerializationContext();

    var objToId = sc.getObjToId();
    // just checking the usual HashMap properties here
    objToId.should.have.property('fnEquals');
    objToId.should.have.property('fnGet');
    objToId.should.have.property('fnHash');
    objToId.should.have.property('hashToBucket');

    objToId.should.equal(sc.objToId);
  });
});