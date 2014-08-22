var Class = require('../../ext/Class');

var TableService = Class.create({
    /**
     * Expected to return an object:
     *
     * {
     *    columns: [{id: 's', tags: your data}, {id: 'p'}]
     *    tags: your data
     * }
     */
    fetchSchema: function() {
        throw new Error('Override me');
    },

    /**
     * Expected to return a promise which yields a countInfo for the number of rows
     * (up to rowLimit)
     */
    fetchCount: function(rowLimit) {
        throw new Error('Override me');
    },

    /**
     * Expected to return a promise which yields an array of objects (maps) from field name to field data
     */
    fetchData: function(limit, offset) {
        throw new Error('Override me');
    },
});

module.exports = TableService;
