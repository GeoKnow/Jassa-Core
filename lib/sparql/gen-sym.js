var Generator = require('./generator');

/**
 * Another class that mimics Jena's behaviour.
 *
 * @param prefix
 * @param start
 * @returns {ns.GenSym}
 */
var GenSym = function(prefix, start) {
    Generator.call(this);

    this.initialize(prefix, start);
};
// inherit
GenSym.prototype = Object.create(Generator.prototype);
// hand back the constructor
GenSym.prototype.constructor = GenSym;

GenSym.prototype.initialize = function(prefix, start) {
    this.prefix = prefix ? prefix : 'v';
    this.nextValue = start ? start : 0;
};

GenSym.prototype.next = function() {
    ++this.nextValue;

    var result = this.prefix + '_' + this.nextValue;

    return result;
};

GenSym.prototype.create = function(prefix) {
    var result = new GenSym(prefix, 0);
    return result;
};

module.exports = GenSym;