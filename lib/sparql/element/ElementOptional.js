var Class = require('../../ext/Class');
var Element = require('./Element');

var ElementOptional = Class.create(Element, {
    classLabel: 'jassa.sparql.ElementOptional',
    initialize: function(optionalElement) {
        this.optionalElement = optionalElement;
        
        if (!(optionalElement instanceof Element)) {
            throw new Error(this.classLabel + ' only accepts an instance of Element as the argument');
        }

    },

    getArgs: function() {
        return [
            this.optionalElement,
        ];
    },

    copy: function(args) {
        if (args.length !== 1) {
            throw 'Invalid argument';
        }

        // FIXME: Should we clone the attributes too?
        var result = new ElementOptional(args[0]);
        return result;
    },

    getVarsMentioned: function() {
        return this.optionalElement.getVarsMentioned();
    },

    copySubstitute: function(fnNodeMap) {
        return new ElementOptional(this.optionalElement.copySubstitute(fnNodeMap));
    },

    flatten: function() {
        var result = new ElementOptional(this.optionalElement.flatten());
        return result;
    },

    toString: function() {
        return 'Optional {' + this.optionalElement + '}';
    },
});

module.exports = ElementOptional;
