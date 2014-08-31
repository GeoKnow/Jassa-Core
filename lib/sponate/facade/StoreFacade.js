var Class = require('../../ext/Class');

var PrefixMappingImpl = require('../../rdf/PrefixMappingImpl');
var ObjectUtils = require('../../util/ObjectUtils');
var Context = require('../Context');
var Engine = require('../Engine');

var CollectionFacade = require('./CollectionFacade');

var ObjectUtils = require('../../util/ObjectUtils');

var StoreFacade = Class.create({
    initialize: function(defaultSparqlService, prefixMapping) {
        this.engine = new Engine(defaultSparqlService);
        this.defaultSparqlService = defaultSparqlService;

        prefixMapping = prefixMapping
            ? prefixMapping instanceof PrefixMappingImpl
                ? prefixMapping
                : new PrefixMappingImpl(prefixMapping)
            : new PrefixMappingImpl();

        this.context = new Context(prefixMapping);
    },

    getEngine: function() {
        return this.engine;
    },

    getContext: function() {
        return this.context;
    },

//    getPrefixMapping: function() {
//        return this.prefixMapping;
//    },

//    getdefaultSparqlService: function() {
//        return this.defaultSparqlService;
//    },

    addMap: function(spec) {
        var name = spec.name;
        if(!name) {
            throw new Error('Mapping must have a non-falsy name attribute');
        }

        //ObjectUtils.extend()
        if(!spec.service) {
            ObjectUtils.extend({}, spec);
            spec.service = this.defaultSparqlService;
        }

        // TODO: Attach the mapping to this object

        this.context.add(spec);

        this[name] = new CollectionFacade(this, name);
    },

    createListService: function(query) {
        this.engine.exec(this.context, query);
    },

});

module.exports = StoreFacade;
