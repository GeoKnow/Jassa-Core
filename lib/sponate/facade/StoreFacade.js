var Class = require('../../ext/Class');

var PrefixMappingImpl = require('../../rdf/PrefixMappingImpl');
var ObjectUtils = require('../../util/ObjectUtils');
var Context = require('../Context');
var Engine = require('../Engine');

var CollectionFacade = require('./CollectionFacade');

var ObjectUtils = require('../../util/ObjectUtils');

var StoreFacade = Class.create({
    initialize: function(defaultSparqlService, prefixMapping) {
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

    addTemplate: function(spec) {
        this.context.addTemplate(spec);
    },

    addMap: function(spec) {
        if(!spec.service) {
            ObjectUtils.extend({}, spec);
            spec.service = this.defaultSparqlService;
        }

        this.context.add(spec);
        var name = spec.name; // context.add will fail if the name is missing

        this[name] = new CollectionFacade(this, name);
    },

    getListService: function(sourceName, isLeftJoin) {
        var result = Engine.createListService(this.context, sourceName, isLeftJoin);
        return result;
    },

});

module.exports = StoreFacade;
