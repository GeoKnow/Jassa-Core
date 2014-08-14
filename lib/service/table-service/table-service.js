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
        console.log('Implement me');
        throw 'Implement me';
    },

    /**
     * Expected to return a promise which yields an integral value for the total number of rows
     */
    fetchCount: function() {
        console.log('Implement me');
        throw 'Implement me';
    },

    /**
     * Expected to return a promise which yields an array of objects (maps) from field name to field data
     */
    fetchData: function() {// limit, offset) {
        console.log('Implement me');
        throw 'Implement me';
    },
});

module.exports = TableService;
