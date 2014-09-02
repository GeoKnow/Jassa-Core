var Class = require('../ext/Class');

var SponateUtils = require('./SponateUtils');
var MappedConceptSource = require('./MappedConceptSource');

var ObjectUtils = require('../util/ObjectUtils');

/**
 * A sponate context is a container for mappings, prefixes
 * and configuration options
 */
var Context = Class.create({
    initialize: function(prefixMapping) {
        this.prefixMapping = prefixMapping;
        this.nameToSource = {};

        this.nameToMappedConcept = {};
    },

    getSource: function(name) {
        return this.nameToSource[name];
    },
//    addMappedConcept: function() {
//
//    },

    addTemplate: function(spec) {
        var name = spec.name;
        if(!name) {
            throw new Error('Sponate spec must have a name');
        }

        var mappedConcept = SponateUtils.parseSpec(spec, this.prefixMapping);

        this.nameToMappedConcept[name] = mappedConcept;
    },

    add: function(spec) {
        var name = spec.name;
        if(!name) {
            throw new Error('Sponate spec must have a name');
        }

        var sparqlService = spec.service;
        if(!sparqlService) {
            throw new Error('No service provided for ', spec);
        }

        var mappedConcept;
        if(ObjectUtils.isString(spec.template)) {
            var templateName = spec.template;
            mappedConcept = this.nameToMappedConcept[templateName];
            if(!mappedConcept) {
                throw new Error('No template with name ' + templateName + ' registered.');
            }
        } else {
            mappedConcept = SponateUtils.parseSpec(spec, this.prefixMapping);
        }
        //console.log('MAPPED CONCEPT ' + name + ': ' + JSON.stringify(mappedConcept, null, null));

        var source = new MappedConceptSource(mappedConcept, sparqlService);

        this.nameToSource[name] = source;
    },
});

module.exports = Context;
