var LookupService = function() {};

LookupService.prototype.getIdStr = function() {//id) {
    console.log('Not overridden');
    throw 'Not overridden';
};

/**
 * This method must return a promise for a Map<Id, Data>
 */
LookupService.prototype.lookup = function() {//ids) {
    console.log('Not overridden');
    throw 'Not overridden';
};

module.exports = LookupService;
