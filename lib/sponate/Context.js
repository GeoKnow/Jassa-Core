var Class = require('../ext/Class');

var SponateUtils = require('./SponateUtils');
var MappedConceptSource = require('./MappedConceptSource');

var MappedConcept = require('./MappedConcept');
var AggUtils = require('./AggUtils');

var ObjectUtils = require('../util/ObjectUtils');
var RefSpec = require('./RefSpec');

var BindingMapperExpr = require('./binding_mapper/BindingMapperExpr');
var ExprVar = require('../sparql/expr/ExprVar');

var AggMap = require('./agg/AggMap');

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

    processRefs: function(baseName, source) {
        var mappedConcept = source.getMappedConcept();
        var sparqlService = source.getSparqlService();
        var agg = mappedConcept.getAgg();

        var refs = AggUtils.getRefs(agg);

        var self = this;

        refs.forEach(function(ref) {
            var refSpec = ref.getRefSpec();
            //console.log('TEMPLATE REF SPEC ' + JSON.stringify(refSpec));

            var target = refSpec.getTarget();

            if(target instanceof MappedConcept) {
                // TODO mappedConcepts used as references are AggObject,
                // however we expect AggMap's - so we have to wrap them

                var aggMap = target.getAgg();
                var aggObject = aggMap.getSubAgg();//target.getAgg();

                //var aggObject = target.getAgg();

                var attrToAgg = aggObject.getAttrToAgg();
                var aggIdLiteral = AggUtils.unwrapAggTransform(attrToAgg.id);
                var idMapper = aggIdLiteral.getBindingMapper();


                aggMap = new AggMap(idMapper, aggObject);

                var newTarget = new MappedConcept(target.getConcept(), aggMap);

                // Allocate a new name and source for this anonymous mapped concept
                var i = 0;
                var name;
                while(self.getSource(name = (baseName + '_' + i))) {
                    ++i;
                }

                ref.setRefSpec(new RefSpec(name, refSpec.getAttr()));
                //console.log('NEW REF SPEC: ' + JSON.stringify(ref));
                //refSpec.setTarget(name);

                var bindingMapper = ref.getBindingMapper();
                if(!bindingMapper) {
                    var c = mappedConcept.getConcept();//newTarget.getConcept();
                    var v = c.getVar();
                    bindingMapper = new BindingMapperExpr(new ExprVar(v));
                    ref.setBindingMapper(bindingMapper);
                }

                var newSource = new MappedConceptSource(newTarget, sparqlService);
                self.nameToSource[name] = newSource;


                //console.log('STATE: ' + JSON.stringify(self.nameToSource, null, 4));
            }
            else if(!ObjectUtils.isString(target)) {
                throw new Error('Unknown target type: ', target);
            }
        });
    },

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
            var tmp = this.nameToMappedConcept[templateName];
            if(!tmp) {
                throw new Error('No template with name ' + templateName + ' registered.');
            }

            mappedConcept = new MappedConcept(tmp.getConcept(), tmp.getAgg().clone());
        } else {
            mappedConcept = SponateUtils.parseSpec(spec, this.prefixMapping);
        }

        //console.log('MAPPED CONCEPT ' + name + ': ' + JSON.stringify(mappedConcept, null, null));

        var source = new MappedConceptSource(mappedConcept, sparqlService);

        this.processRefs(name, source);

        this.nameToSource[name] = source;
    },
});

module.exports = Context;
