var Class = require('../../ext/Class');

/**
 * Note used yet.
 * searchMode: exact, regex, beginsWith, endsWith
 */
var FilterString = Class.create({
    initialize: function(str, mode) {
        this.str = str;
        this.mode = mode;
    }
});

