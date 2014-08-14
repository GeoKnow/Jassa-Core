// lib deps
var uniq = require('lodash.uniq');

// project deps
var ElementTriplesBlock = require('./element-triples-block');
var ElementFilter = require('./element-filter');
var ElementGroup = require('./element-group');
var uniqTriples = require('../uniq-triples');
var getVarName = require('../get-var-name');
var GenSym = require('../gen-sym');
var GeneratorBlacklist = require('../generator-blacklist');
var HashBidiMap = require('../../util/hash-bidi-map');
var fnNodeEquals = require('../node-equals');
var NodeFactory = require('../../rdf/NodeFactory');

var ElementUtils = {
    createFilterElements: function(exprs) {
        var result = exprs.map(function(expr) {
            var r = new ElementFilter(expr);
            return r;
        });

        return result;
    },

    createElementsTriplesBlock: function(triples) {
        var result = [];

        if (triples.length > 0) {
            var element = new ElementTriplesBlock(triples);
            result.push(element);
        }

        return result;
    },

    flatten: function(elements) {
        var result = elements.map(function(element) {
            var r = element.flatten();
            return r;
        });

        return result;
    },

    /**
     * Bottom up
     * - Merge ElementTripleBlocks
     * - Merge ElementGroups
     */
    flattenElements: function(elements) {
        var result = [];

        // Flatten out ElementGroups by 1 level; collect filters
        var tmps = [];
        elements.forEach(function(item) {
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

        if (triples.length > 0) {
            var ts = uniqTriples(triples);

            result.push(new ElementTriplesBlock(ts));
        }

        result.push.apply(result, rest);

        var uniqFilters = uniq(filters, function(x) {
            return x.toString();
        });
        result.push.apply(result, uniqFilters);

        // console.log("INPUT ", elements);
        // console.log("OUTPUT ", result);

        return result;
    },

    /**
     * Returns a map that maps *each* variable from vbs to a name that does not appear in vas.
     */
    createDistinctVarMap: function(vas, vbs, generator) {
        var vans = vas.map(getVarName);

        if (generator === null) {
            var g = new GenSym('v');
            generator = new GeneratorBlacklist(g, vans);
        }

        // Rename all variables that are in common
        // FIXME: fnNodeEquals is not defined (commented out in sponate-utils.js as of 2014-06-05)
        var result = new HashBidiMap(fnNodeEquals);
        // var rename = {};

        vbs.forEach(function(oldVar) {
            var vbn = oldVar.getName();

            var newVar;
            if (vans.indexOf(vbn) !== -1) {
                var newName = generator.next();
                newVar = NodeFactory.createVar(newName);

            } else {
                newVar = oldVar;
            }

            // rename[vcn] = newVar;

            // TODO Somehow re-use existing var objects...
            // var oldVar = ns.Node.v(vcn);

            result.put(oldVar, newVar);
        });

        return result;
    },

    /**
     * distinctMap is the result of making vbs and vas distinct
     *
     * [?s ?o] [?s ?p] join on ?o = ?s
     *
     * Step 1: Make overlapping vars distinct
     * [?s ?o] [?x ?p] -> {?s: ?x, ?p: ?p}
     *
     * Step 2: Make join vars common again
     * [?s ?o] [?x ?s] -> {?s: ?x, ?p: ?s}
     */
    createJoinVarMap: function(sourceVars, targetVars, sourceJoinVars, targetJoinVars, generator) {

        if (sourceJoinVars.length !== targetJoinVars.length) {
            console.log('[ERROR] Cannot join on different number of columns');
            throw 'Bailing out';
        }

        var result = ElementUtils.createDistinctVarMap(sourceVars, targetVars, generator);

        for (var i = 0; i < sourceJoinVars.length; ++i) {
            var sourceJoinVar = sourceJoinVars[i];
            var targetJoinVar = targetJoinVars[i];

            // Map targetVar to sourceVar
            result.put(targetJoinVar, sourceJoinVar);
            // rename[targetVar.getName()] = sourceVar;
        }

        return result;
    },

    /**
     * Var map must be a bidi map
     */
    createRenamedElement: function(element, varMap) {
        var fnSubst = function(v) {
            var result = varMap.get(v); // [v.getName()];
            return result;
        };

        // debugger;
        var newElement = element.copySubstitute(fnSubst);

        return newElement;
    },

    joinElements: function(separator, elements) {
        var strs = elements.map(function(element) {
            return element.toString();
        });
        var filtered = strs.filter(function(str) {
            return str.length !== 0;
        });

        return filtered.join(separator);
    },

    /**
     * Returns a new array of those triples, that are directly part of the given array of elements.
     * 
     */
    getElementsDirectTriples: function(elements) {
        var result = [];
        for(var i = 0; i < elements.length; ++i) {
            var element = elements[i];
            if(element instanceof sparql.ElementTriplesBlock) {
                result.push.apply(result, element.triples);
            }
        }
        
        return result;
    },

};

module.exports = ElementUtils;
