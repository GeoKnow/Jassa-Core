var Class = require('../../ext/Class');

var LookupService = Class.create({
    getIdStr: function() { // id) {
        console.log('Not overridden');
        throw 'Not overridden';
    },

    /**
     * This method must return a promise for a Map<Id, Data>
     */
    lookup: function() { // ids) {
        console.log('Not overridden');
        throw 'Not overridden';
    },
});

module.exports = LookupService;
