var Class = require('../../ext/Class');

/**
 * A data service only provides a single method for retrieving data based on some 'key' (thing)
 * The key can be an arbitrary object that identifies a collection (e.g. a tag), a sparql concept, etc...
 */
var DataService = Class.create({
    fetchData: function() { // thing) {
        throw new Error('Not implemented');
    },

});

module.exports = DataService;
