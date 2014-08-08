var Class = require('../ext/class');
var Generator = require('./generator');

/**
 *
 * @param generator
 * @param blacklist Array of strings
 * @returns {ns.GeneratorBlacklist}
 */
var GeneratorBlacklist = Class.create(Generator, {
    initialize: function(generator, blacklist) {
        this.generator = generator;
        this.blacklist = blacklist;
    },

    next: function() {
        var result;

        do {
            result = this.generator.next();
        } while (this.blacklist.indexOf(result) !== -1);

        return result;
    },
});

module.exports = GeneratorBlacklist;