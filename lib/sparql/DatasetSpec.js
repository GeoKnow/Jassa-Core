var Class = require('../ext/Class');
var ObjectUtils = require('../util/ObjectUtils');

//var reduce = require('lodash.reduce');
var uniq = require('lodash.uniq');


/**
 * A specification of an RDF Dataset
 *
 * http://www.w3.org/TR/sparql11-query/#rdfDataset
 *
 */
var DatasetSpec = {
    initialize: function(defaultGraphIris, namedGraphIris) {
        this.defaultGraphIris = defaultGraphIris || [];
        this.namedGraphIris = namedGraphIris || [];
    },

    getDefaultGraphIris: function() {
        return this.defaultGraphIris;
    },

    getNamedGraphIris: function() {
        return this.namedGraphIris;
    },

    getIrisMentioned: function() {
        var raw = this.defaultGraphIris.concat(this.namedGraphIris);
        var result = uniq(raw);
        return result;
    },

    hashCode: function() {
        if(this.hash == null) {
            this.hash = ObjectUtils.hashCode(this);
        }

        return this.hash;
    },

    equals: function(that) {
        var result = ObjectUtils.isEqual(this, that);
        return result;
    },

    toString: function() {
        return 'DatasetSpec: ' + JSON.stringify(this);
    }
};


module.exports = DatasetSpec;
