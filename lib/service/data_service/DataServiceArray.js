var Class = require('../../ext/Class');
var DataService = require('./DataService');

var shared = require('../../util/shared');
var Promise = shared.Promise;

/**
 * A data service only provides a single method for retrieving data based on some 'key' (thing)
 * The key can be an arbitrary object that identifies a collection (e.g. a tag), a sparql concept, etc...
 */
var DataServiceArray = Class.create(DataService, {
    initialize: function(data) {
        this.data = data || [];
    },

    fetchData: function(thing) {
        var result = Promise.resolve(this.data);
        return result;
    },

});

module.exports = DataServiceArray;
