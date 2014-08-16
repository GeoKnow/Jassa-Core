var Class = require('../../ext/Class');
var Element = require('./Element');

var ElementSubQuery = Class.create(Element, {
    classLabel: 'jassa.sparql.ElementSubQuery',
    initialize: function(query) {
        this.query = query;
    },

    getArgs: function() {
        return [];
    },

    copy: function(args) {
        if (args.length !== 0) {
            throw 'Invalid argument';
        }

        // FIXME: Should we clone the attributes too?
        var result = new ElementSubQuery(this.query);
        return result;
    },

    toString: function() {
        return '{ ' + this.query + ' }';
    },

    copySubstitute: function(fnNodeMap) {
        return new ElementSubQuery(this.query.copySubstitute(fnNodeMap));
    },

    flatten: function() {
        return new ElementSubQuery(this.query.flatten());
    },

    getVarsMentioned: function() {
        return this.query.getVarsMentioned();
    },
});

module.exports = ElementSubQuery;
