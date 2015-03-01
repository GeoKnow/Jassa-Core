// lib deps
var uniq = require('lodash.uniq');

// project deps
var ElementTriplesBlock = require('./element/ElementTriplesBlock');
var ElementFilter = require('./element/ElementFilter');
var ElementGroup = require('./element/ElementGroup');
var ElementSubQuery = require('./element/ElementSubQuery');
var TripleUtils = require('./../rdf/TripleUtils');
var VarUtils = require('./VarUtils');
var GenSym = require('./GenSym');
var GeneratorBlacklist = require('./GeneratorBlacklist');
var HashBidiMap = require('../util/collection/HashBidiMap');
//var ObjectUtils = require('../util/ObjectUtils'); // node-equals
var NodeFactory = require('../rdf/NodeFactory');

var Query = require('./Query');
var ExprAggregator = require('./expr/ExprAggregator');
var AggCount = require('./agg/AggCount');

var ElementUtils = {

    isEmpty: function(element) {
        var result = element == null || element instanceof ElementGroup && element.getArgs().length === 0;

        return result;
    },


    groupIfNeeded: function(elements) {
        var result = elements.length != 1
            ? new ElementGroup(elements)
            : elements[0]
            ;
        return result;
    },

    createQueryCountRows: function(element, countVar, rowLimit) {
        var e;
        if(rowLimit == null) {
            e = element;
        } else {
            var subQuery = new Query();
            subQuery.setQuerySelectType();
            subQuery.setQueryPattern(element);
            subQuery.setQueryResultStar(true);
            subQuery.setLimit(rowLimit);
            e = new ElementSubQuery(element);
        }

        var result = new Query();
        result.setQuerySelectType();
        result.setQueryPattern(e);
        result.getProject().add(countVar, new ExprAggregator(null, new AggCount()));

        return result;
    },

    createFilterElements: function(exprs) {
        var result = exprs.map(function(expr) {
            var r = new ElementFilter(expr);
            return r;
        });

        return result;
    },

    // TODO Get rid of this method
    // @Deprecated
    createElementsTriplesBlock: function(triples) {
        var result = [];

        if (triples.length > 0) {
            var element = new ElementTriplesBlock(triples);
            result.push(element);
        }

        return result;
    },

    /**
     * Returns a map that maps *each* variable from vbs to a name that does not appear in vas.
     */
    createDistinctVarMap: function(vas, vbs, generator) {
        var vans = vas.map(VarUtils.getVarName);

        if (generator == null) {
            var g = new GenSym('v');
            generator = new GeneratorBlacklist(g, vans);
        }

        // Rename all variables that are in common
        // FIXME: fnNodeEquals is not defined (commented out in sponate-utils.js as of 2014-06-05)
        var result = new HashBidiMap();
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
        var fnSubst = VarUtils.fnSubst(varMap);

        // debugger;
        var newElement = element.copySubstitute(fnSubst);

        return newElement;
    },

    /**
     * Returns a new array of those triples, that are directly part of the given array of elements.
     *
     */
    getElementsDirectTriples: function(elements) {
        var result = [];
        for(var i = 0; i < elements.length; ++i) {
            var element = elements[i];
            if(element instanceof ElementTriplesBlock) {
                result.push.apply(result, element.triples);
            }
        }

        return result;
    },

    freshVar: function(element, baseVarName) {
        var gen = this.freshVarGen(element, baseVarName);
        var result = gen.next();
        //console.log('freshVar: ' + result);
        return result;
    },


    /**
     * Creates a generator for fresh variables not appearing in the element
     */
    freshVarGen: function(element, baseVarName) {
        baseVarName = baseVarName || 'v';

        var blacklistVars = element.getVarsMentioned();
        var result = VarUtils.freshVarGen(baseVarName, blacklistVars);
        return result;
    }
};

module.exports = ElementUtils;
