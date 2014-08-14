var Class = require('../ext/Class');

/**
 * A reference to another sponate mapping
 *
 */
var MappingRef = Class.create({
    initialize: function(mapName, tableRef, attrPath) {
        this.mapName = mapName;
        this.tableRef = tableRef;
    },

    getMapName: function() {
        return this.mapName;
    },

    getTableRef: function() {
        return this.tableRef;
    },

    getAttrPath: function() {
        return this.attrPath;
    },

    toString: function() {
        var result = this.patternRef + '/' + this.tableRef + '@' + this.attrPath;
        return result;
    },

});

module.exports = MappingRef;
