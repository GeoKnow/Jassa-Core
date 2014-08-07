var TableService = function() {};

/**
 * Expected to return an object:
 *
 * {
 *    columns: [{id: 's', tags: your data}, {id: 'p'}]
 *    tags: your data
 * }
 */
TableService.prototype.fetchSchema = function() {
    console.log('Implement me');
    throw 'Implement me';
};

/**
 * Expected to return a promise which yields an integral value for the total number of rows
 */
TableService.prototype.fetchCount = function() {
    console.log('Implement me');
    throw 'Implement me';
};

/**
 * Expected to return a promise which yields an array of objects (maps) from field name to field data
 */
TableService.prototype.fetchData = function() {
    console.log('Implement me');
    throw 'Implement me';
};

module.exports = TableService;