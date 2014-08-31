var Class = require('../ext/Class');

var SponateUtils = require('./SponateUtils');
var MappedConceptSource = require('./MappedConceptSource');

/**
 * A sponate context is a container for mappings, prefixes
 * and configuration options
 */
var Context = Class.create({
    initialize: function(prefixMapping) {
        this.prefixMapping = prefixMapping;
        this.nameToSource = {};
    },

    getSource: function(name) {
        return this.nameToSource[name];
    },
//    addMappedConcept: function() {
//
//    },

    add: function(spec) {
        var name = spec.name;
        if(!name) {
            throw new Error('Sponate spec must have a name');
        }

        var sparqlService = spec.service;
        if(!sparqlService) {
            throw new Error('No service provided for ', spec);
        }

        var mappedConcept = SponateUtils.parseSpec(spec, this.prefixMapping);
        var source = new MappedConceptSource(mappedConcept, sparqlService);

        this.nameToSource[name] = source;
    },
});

module.exports = Context;
