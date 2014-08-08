var Class = require('../../ext/class');
var Element = require('./element');

var ElementOptional = Class.create(Element, {
    classLabel: 'jassa.sparql.ElementOptional',
    initialize: function(element) {
        this.optionalPart = element;
    },

    getArgs: function() {
        return [this.optionalPart];
    },

    copy: function(args) {
        if (args.length !== 1) {
            throw 'Invalid argument';
        }

        // FIXME: Should we clone the attributes too?
        var result = new ElementOptional(this.expr);
        return result;
    },

    getVarsMentioned: function() {
        return this.optionalPart.getVarsMentioned();
    },

    copySubstitute: function(fnNodeMap) {
        return new ElementOptional(this.optionalPart.copySubstitute(fnNodeMap));
    },

    flatten: function() {
        return new ElementOptional(this.optionalPart.flatten());
    },

    toString: function() {
        return 'Optional {' + this.optionalPart + '}';
    },
});

module.exports = ElementOptional;