var Class = require('../ext/Class');

var SponateUtils = require('./SponateUtils');

/**
 * A sponate context is a container for mappings, prefixes
 * and configuration options
 */
var Context = Class.create({
    initialize: function(prefixMapping) {
        this.prefixMapping = prefixMapping;
        this.nameToMappedConcept = {};
    },

    getMappedConcept: function(name) {
        return this.nameToMappedConcept[name];
    },
//    addMappedConcept: function() {
//
//    },

    add: function(spec) {
        var name = spec.name;
        if(!name) {
            throw new Error('Sponate spec must have a name');
        }

        var mappedConcept = SponateUtils.parseSpec(spec, this.prefixMapping);
        this.nameToMappedConcept[name] = mappedConcept;
    },
});

module.exports = Context;
