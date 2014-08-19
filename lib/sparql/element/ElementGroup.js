var uniq = require('lodash.uniq');

var Class = require('../../ext/Class');
var Element = require('./Element');
var ElementFilter = require('./ElementFilter');
var ElementTriplesBlock = require('./ElementTriplesBlock');
var TripleUtils = require('../../rdf/TripleUtils');
var ElementHelpers = require('./../ElementHelpers');
var PatternUtils = require('../PatternUtils');

var ElementGroup = Class.create(Element, {
    classLabel: 'jassa.sparql.ElementGroup',
    initialize: function(elements) {
        this.elements = elements ? elements : [];

        if(!Array.isArray(this.elements)) {
            throw new Error(this.classLabel + ' expects a single argument of type array, got [' + arguments.length + '] args; ' + typeof elements + ': ' + elements);
        }

    },

    addElement: function(element) {
        this.elements.push(element);
    },

    getArgs: function() {
        return this.elements;
    },

    copy: function(args) {
        var result = new ElementGroup(args);
        return result;
    },

    copySubstitute: function(fnNodeMap) {
        var newElements = this.elements.map(function(x) {
            return x.copySubstitute(fnNodeMap);
        });
        return new ElementGroup(newElements);
    },

    getVarsMentioned: function() {
        var result = PatternUtils.getVarsMentioned(this.elements);
        return result;
    },

    toString: function() {
        // return this.elements.join(" . ");
        return ElementHelpers.joinElements(' . ', this.elements);
    },

    flatten: function() {

        // Recursively call flatten the children
        var els = this.elements.map(function(element) {
            var r = element.flatten();
            return r;
        });

        // Flatten out ElementGroups by 1 level; collect filters
        var tmps = [];
        els.forEach(function(item) {
            if (item instanceof ElementGroup) {
                tmps.push.apply(tmps, item.elements);
            } else {
                tmps.push(item);
            }
        });

        var triples = [];
        var filters = [];
        var rest = [];

        // Collect the triple blocks
        tmps.forEach(function(item) {
            if (item instanceof ElementTriplesBlock) {
                triples.push.apply(triples, item.getTriples());
            } else if (item instanceof ElementFilter) {
                filters.push(item);
            } else {
                rest.push(item);
            }
        });

        var newElements = [];

        if (triples.length > 0) {
            var ts = TripleUtils.uniqTriples(triples);

            newElements.push(new ElementTriplesBlock(ts));
        }

        newElements.push.apply(newElements, rest);

        var uniqFilters = uniq(filters, false, function(x) {
            return x.toString();
        });
        newElements.push.apply(newElements, uniqFilters);

        var result = (newElements.length === 1) ? newElements[0] : new ElementGroup(newElements);

        return result;
    },
});

module.exports = ElementGroup;
