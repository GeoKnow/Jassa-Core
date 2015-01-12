var Class = require('../../ext/Class');

var CollectionUtils = require('../../util/CollectionUtils');
var TableMod = require('./TableMod');

var ElementUtils = require('../ElementUtils');

var Path = require('../Path');
var Concept = require('../../sparql/Concept');

// TODO: Maybe this class should be TableModFacet and inherit from TableMod?
var TableConfigFacet = Class.create({
    initialize: function(facetConfig, tableMod, paths) {
        this.facetConfig = facetConfig;
        this.tableMod = tableMod || new TableMod();
        this.paths = paths || []; //new util.ArrayList();
    },

    getFacetConfig: function() {
        return this.facetConfig;
    },

    getTableMod: function() {
        return this.tableMod;
    },

    getPaths: function() {
        return this.paths;
    },

    /**
     * Return the path for a given column id
     */
    getPath: function(colId) {
        var index = this.tableMod.getColumnIds().indexOf(colId);
        var result = this.paths[index];
        return result;
    },

    getColumnId: function(path) {
        var index = this.paths.firstIndexOf(path);
        var result = this.tableMod.getColumnIds()[index];
        return result;
    },

    removeColumn: function(colId) {
        var path = this.getPath(colId);
        this.paths.remove(path);
    },

    getColIdForPath: function(path) {
        var rootFacetNode = this.facetConfig.getRootFacetNode();
        var facetNode = rootFacetNode.forPath(path);
        var result = facetNode.getVar().getName();

        return result;
    },

    togglePath: function(path) {
        // Updates the table model accordingly
        var status = CollectionUtils.toggleItem(this.paths, path);

        var varName = this.getColIdForPath(path);

        if(status) {
            this.tableMod.addColumn(varName);
        }
        else {
            this.tableMod.removeColumn(varName);
        }
    },

    createDataConcept: function() {
        var emptyPath = new Path();
        var paths = this.paths.slice(0);

        if(!this.paths.contains(emptyPath)) {
            paths.push(emptyPath);
        }

        var dataElement = ElementUtils.createElementTable(this.facetConfig, paths);//new ElementFactoryFacetPaths(this.facetConfig, paths);
        //var dataElement = dataElementFactory.createElement();

        var rootFacetNode = this.facetConfig.getRootFacetNode();
        var dataVar = rootFacetNode.getVar();

        var result = new Concept(dataElement, dataVar);

        return result;
    }

/*
    createQueryFactory: function() {
        // create an ElementFactory based on the paths and the facetConfig
        var elementFactory = new ns.ElementFactoryFacetPaths(this.facetConfig, this.paths);

        var queryFactory = new ns.QueryFactoryTableMod(elementFactory, tableMod);

        return queryFactory;
    }
*/
});

module.exports = TableConfigFacet;

