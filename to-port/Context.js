var Class = require('../ext/Class');

var PatternParser =  require('./PatternParser');
var CriteriaParser =  require('./CriteriaParser');

var Context = Class.create({

    initialize: function() {
        // this.schema = schema ? schema : new Schema();
        // this.prefixMapping = new sparql.PrefixMappingImpl();

        // TODO We should not map to element directly, but to ElementProvider
        this.tableNameToElementFactory = {};

        // Note: the names of mappings and tables are in different namespaces
        // In fact, in most cases tables are implicitely created - with the name of the mapping
        this.nameToMapping = {};

        this.patternParser = new PatternParser();

        this.criteriaParser = new CriteriaParser();
    },

//    getSchema: function() {
//        return this.schema;
//    },

    getPrefixMapping: function() {
        return this.prefixMapping;
    },

    getPatternParser: function() {
        return this.patternParser;
    },

    getTableNameToElementFactory: function() {
        return this.tableNameToElementFactory;
    },

    getNameToMapping: function() {
        return this.nameToMapping;
    },

    mapTableNameToElementFactory: function(tableName, elementFactory) {
        this.tableNameToElementFactory[tableName] = elementFactory;
    },

    addMapping: function(name, mapping) {
        // var name = mapping.getName();
        this.nameToMapping[name] = mapping;
    },

    getMapping: function(mappingName) {
        var result = this.nameToMapping[mappingName];
        return result;
    },

    getElementFactory: function(tableName) {
        var result = this.tableNameToElementFactory[tableName];
        return result;
    },

    getCriteriaParser: function() {
        return this.criteriaParser;
    },

});

module.exports = Context;
