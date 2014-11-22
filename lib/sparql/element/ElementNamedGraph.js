var union = require('lodash.union');

var Class = require('../../ext/Class');
var Element = require('./Element');

var ElementNamedGraph = Class.create(Element, {
    classLabel: 'jassa.sparql.ElementNamedGraph',
    initialize: function(node, element) {
        this.node = node;
        this.element = element;
    },

    getArgs: function() {
        return [this.element];
    },

    copy: function(args) {
        if (args.length !== 1) {
            throw new Error('Invalid argument');
        }

        // FIXME: Should we clone the attributes too?
        var result = new ElementNamedGraph(this.node, args[0]);
        return result;
    },

    getVarsMentioned: function() {
        var result = this.element.getVarsMentioned();
        if(this.node.isVar()) {
            result = union(result, this.node);
        }
        return result;
    },

    copySubstitute: function(fnNodeMap) {
        return new ElementNamedGraph(NodeUtils.getSubstitute(this.node, fnNodeMap), this.element.copySubstitute(fnNodeMap));
    },

    flatten: function() {
        var result = new ElementNamedGraph(this.element.flatten());
        return result;
    },

    toString: function() {
        var result = this.node != null
            ? 'Graph ' + this.node + ' { ' + this.element + ' }'
            : '{ ' + this.element + ' }'
            ;

        return result;
    },
});

module.exports = ElementNamedGraph;
