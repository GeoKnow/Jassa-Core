var uniq = require('lodash.uniq');

var Class = require('../../ext/Class');
var Element = require('./Element');
var ElementFilter = require('./ElementFilter');
var ElementTriplesBlock = require('./ElementTriplesBlock');
var TripleUtils = require('../../rdf/TripleUtils');
var ElementHelpers = require('./../ElementHelpers');
var PatternUtils = require('../PatternUtils');

var ElementUnion = Class.create(Element, {
    classLabel: 'jassa.sparql.ElementUnion',
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
        var result = new ElementUnion(args);
        return result;
    },

    copySubstitute: function(fnNodeMap) {
        var newElements = this.elements.map(function(x) {
            return x.copySubstitute(fnNodeMap);
        });
        return new ElementUnion(newElements);
    },

    getVarsMentioned: function() {
        var result = PatternUtils.getVarsMentioned(this.elements);
        return result;
    },

    toString: function() {
        // return this.elements.join(" . ");
        //var result = this.
        //return ElementHelpers.joinElements(' Union ', this.elements);
        var result = '{' + this.elements.join(' } Union {') + '}';
        return result;
    },

    flatten: function() {

        // Recursively call flatten the children
        var els = this.elements.map(function(element) {
            var r = element.flatten();
            return r;
        });

        var result = new ElementUnion(els);
        return result;
    },

});

module.exports = ElementUnion;
