var union = require('lodash.union');
var shared = require('../util/shared');
var Promise = shared.Promise;

var ResultSetArrayIteratorBinding = require('./result_set/ResultSetArrayIteratorBinding');

var ArrayUtils = require('../util/ArrayUtils');
var IteratorArray = require('../util/collection/IteratorArray');

var ExprVar = require('../sparql/expr/ExprVar');
var ElementFilter = require('../sparql/element/ElementFilter');
var E_OneOf = require('../sparql/expr/E_OneOf');
var ElementSubQuery = require('../sparql/element/ElementSubQuery');
var VarUtils = require('../sparql/VarUtils');
var Binding = require('../sparql/Binding');

var ConceptUtils = require('../sparql/ConceptUtils');
var QueryUtils = require('../sparql/QueryUtils');

var ServiceUtils = {

    // FIXME constrainQueryVar, constrainQueryExprVar, chunkQuery should go to a different place, such as sparql.QueryUtils
    constrainQueryVar: function(query, v, nodes) {
        var exprVar = new ExprVar(v);
        var result = this.constrainQueryExprVar(query, exprVar, nodes);
        return result;
    },

    constrainQueryExprVar: function(query, exprVar, nodes) {
        var result = query.clone();
        var e = new ElementFilter(new E_OneOf(exprVar, nodes));
        result.getElements().push(e);

        return result;
    },

    /**
     * Returns an array of queries where the variable v has been constraint to elements in nodes.
     */
    chunkQuery: function(query, v, nodes, maxChunkSize) {
        var chunks = ArrayUtils.chunk(nodes, maxChunkSize);
        var exprVar = new ExprVar(v);

        var self = this;
        var result = chunks.map(function() { // chunk) {
            var r = self.constrainQueryExprVar(query, exprVar, nodes);
            return r;
        });

        return result;
    },

    mergeResultSets: function(arrayOfResultSets) {
        var bindings = [];
        var varNames = [];
        arrayOfResultSets.forEach(function(rs) {
            var vns = rs.getVarNames();
            varNames = union(varNames, vns);

            var arr = rs.getIterator().getArray();
            bindings.push.apply(bindings, arr);
        });

        var itBinding = new IteratorArray(bindings);
        var result = new ResultSetArrayIteratorBinding(itBinding, varNames);

        return result;
    },

    execSelectForNodes: function(sparqlService, query, v, nodes, maxChunkSize) {
        var queries = this.chunkQuery(query, v, nodes, maxChunkSize);

        var promises = queries.map(function(query) {
            var qe = sparqlService.createQueryExecution(query);
            var r = qe.execSelect();
            return r;
        });

        var masterTask = Promise.all(promises);

        var self = this;
        var result = masterTask.then(function( /* arguments will be result sets */ ) {
            var r = self.mergeResultSets(arguments);
            return r;
        });

        return result;
    },

    /**
     * TODO Rather use .close()
     *
     * @param {Object} rs
     * @returns
     */
    consumeResultSet: function(rs) {
        while (rs.hasNext()) {
            rs.nextBinding();
        }
    },

    resultSetToList: function(rs, variable) {
        var result = [];
        while (rs.hasNext()) {
            var binding = rs.nextBinding();

            var node = binding.get(variable);
            result.push(node);
        }
        return result;
    },

    // TODO: If there is only one variable in the rs, use it.
    resultSetToInt: function(rs, variable) {
        var result = null;

        if (rs.hasNext()) {
            var binding = rs.nextBinding();

            var node = binding.get(variable);

            // TODO Validate that the result actually is int.
            result = node.getLiteralValue();
        }

        return result;
    },

    fetchList: function(queryExecution, variable) {
        var self = this;
        var result = queryExecution.execSelect().then(function(rs) {
            var r = self.resultSetToList(rs, variable);
            return r;
        });

        return result;
    },

    /**
     * Fetches the first column of the first row of a result set and parses it as int.
     *
     */
    fetchInt: function(queryExecution, variable) {
        var self = this;
        var result = queryExecution.execSelect().then(function(rs) {
            var r = self.resultSetToInt(rs, variable);
            return r;
        });

        return result;
    },

    fetchCountConcept: Promise.method(function(sparqlService, concept, threshold) {

        var outputVar = ConceptUtils.freshVar(concept);

        var scanLimit = threshold == null ? null : threshold + 1;

        var countQuery = ConceptUtils.createQueryCount(concept, outputVar, scanLimit);

        var qe = sparqlService.createQueryExecution(countQuery);

        return ServiceUtils
            .fetchInt(qe, outputVar)
            .then(function(count) {
                var hasMoreItems = count > threshold;

                var r = {
                    count: hasMoreItems ? threshold : count,
                    limit: threshold,
                    hasMoreItems: hasMoreItems,
                };

                return r;
            });
    }),

    /**
     * Count the results of a query, whith fallback on timeouts
     *
     * Attempt to count the full result set based on firstTimeoutInMs
     *
     * if this fails, repeat the count attempt using the scanLimit
     *
     * TODO Finish
     */
    fetchCountQuery: Promise.method(function(sparqlService, query, firstTimeoutInMs, limit) {

        var elements = [
            new ElementSubQuery(query),
        ];

        var varsMentioned = query.getVarsMentioned();

        var varGen = VarUtils.createVarGen('c', varsMentioned);

        var outputVar = varGen.next();
        // var outputVar = rdf.NodeFactory.createVar('_cnt_');

        // createQueryCount(elements, limit, variable, outputVar, groupVars, useDistinct, options)
        var countQuery = QueryUtils.createQueryCount(elements, null, null, outputVar, null, null, null);

        var qe = sparqlService.createQueryExecution(countQuery);
        qe.setTimeout(firstTimeoutInMs);

        return ServiceUtils.fetchInt(qe, outputVar)
            .then(function(count) {
                return {
                    count: count,
                    limit: null,
                    hasMoreItems: false,
                };
            })
            .catch(function() {
                // Try counting with the fallback size
                var countQuery = QueryUtils.createQueryCount(elements, limit + 1, null, outputVar, null, null, null);
                var qe = sparqlService.createQueryExecution(countQuery);
                return ServiceUtils.fetchInt(qe, outputVar)
                    .then(function(count) {
                        return {
                            count: count,
                            limit: limit,
                            hasMoreItems: count > limit,
                        };
                    });
            });
    }),

    // ns.globalSparqlCacheQueue = [];

    fetchItemsConcept: function(sparqlService, concept, limit, offset) {
        var query = ConceptUtils.createQueryList(concept, limit, offset);
        var qe = sparqlService.createQueryExecution(query);

        var result = qe.execSelect().then(function(rs) {
            var r = ServiceUtils.resultSetToList(rs, concept.getVar());
            return r;
        });

        return result;
    },
};

module.exports = ServiceUtils;
