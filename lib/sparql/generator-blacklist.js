var Generator = require('./generator');

/**
 *
 * @param generator
 * @param blacklist Array of strings
 * @returns {ns.GeneratorBlacklist}
 */
var GeneratorBlacklist = function(prefix, start) {
    Generator.call(this);

    this.initialize(prefix, start);
};
// inherit
GeneratorBlacklist.prototype = Object.create(Generator.prototype);
// hand back the constructor
GeneratorBlacklist.prototype.constructor = GeneratorBlacklist;

GeneratorBlacklist.prototype.initialize = function(generator, blacklist) {
    this.generator = generator;
    this.blacklist = blacklist;
};

GeneratorBlacklist.prototype.next = function() {
    var result;

    do {
        result = this.generator.next();
    } while (this.blacklist.indexOf(result) !== -1);

    return result;
};

module.exports = GeneratorBlacklist;
