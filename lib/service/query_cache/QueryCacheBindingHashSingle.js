/* jshint evil: true */
var Class = require('../../ext/Class');
var ExprEvaluatorImpl = require('../../sparql/ExprEvaluatorImpl');
var IteratorArray = require('../../util/collection/IteratorArray');
var ResultSetArrayIteratorBinding = require('../result_set/ResultSetArrayIteratorBinding');
var E_OneOf = require('../../sparql/expr/E_OneOf');
var ElementFilter = require('../../sparql/element/ElementFilter');
var shared = require('../../util/shared');
var Promise = shared.Promise;

var QueryCacheBindingHashSingle = Class.create({
    initialize: function(sparqlService, query, indexExpr) {
        this.sparqlService = sparqlService;
        this.query = query;

        // this.indexVarName = indexVarName;
        this.indexExpr = indexExpr;

        this.maxChunkSize = 50;

        // this.indexVar = rdf.

        this.exprEvaluator = new ExprEvaluatorImpl();

        this.nodeToBindings = {}; // new Cache(); // FIXME: add cache thingy

        // Cache for nodes for which no data existed
        this.nodeMisses = {}; // new Cache(); // FIXME: add cache thingy
    },

    fetchResultSet: function(nodes) {
        var self = this;
        var nodeToBindings = this.nodeToBindings;

        var stats = this.analyze(nodes);

        var resultBindings = [];

        // Fetch data from the cache
        stats.cachedNodes.forEach(function(node) {
            var bindings = nodeToBindings.getItem(node.toString());
            resultBindings.push.apply(resultBindings, bindings);
        });

        // Fetch data from the chunks

        var fetchTasks = stats.nonCachedChunks.map(function(chunk) {
            var promise = self.fetchChunk(chunk);
            return promise;
        });

        var masterTask = Promise.all(fetchTasks);

        var exprEvaluator = this.exprEvaluator;
        var indexExpr = this.indexExpr;

        // TODO Cache the misses
        return masterTask.then(function() {
            var seenKeys = {};

            for (var i = 0; i < arguments.length; ++i) {
                var rs = arguments[i];
                while (rs.hasNext()) {
                    var binding = rs.nextBinding();

                    resultBindings.push(binding);

                    var keyNode = exprEvaluator.eval(indexExpr, binding);

                    var hashKey = keyNode.toString();

                    // Keep track of which nodes we have encountered
                    seenKeys[hashKey] = keyNode;

                    var cacheEntry = nodeToBindings.getItem(hashKey);
                    if (cacheEntry == null) {
                        cacheEntry = [];
                        nodeToBindings.setItem(hashKey, cacheEntry);
                    }

                    cacheEntry.push(binding);
                }
            }

            var itBinding = new IteratorArray(resultBindings);
            var r = new ResultSetArrayIteratorBinding(itBinding);

            return r;
        });
    },

    fetchChunk: function(nodes) {
        var query = this.query.clone();

        var filterExpr = new E_OneOf(this.indexExpr, nodes);
        var filterElement = new ElementFilter([
            filterExpr,
        ]);
        query.getElements().push(filterElement);

        var qe = this.sparqlService.createQueryExecution(query);

        var result = qe.execSelect();
        return result;
        // var v = rdf.NodeFactory.createVar(this.index);
    },

    /**
     * Given an array of nodes, this method returns:
     * (a) the array of nodes for which cache entries exist
     * (b) the array of nodes for which NO cache entries exist
     * (c) the array of nodes for which it is known that no data exists
     * (c) chunked arrays of nodes for which no cache entries exist
     * (d) the maxChunkSize used to create the chunks
     *
     * @param {Array} nodes
     * @returns
     */
    analyze: function(nodes) {
        var nodeToBindings = this.nodeToBindings;

        var cachedNodes = [];
        var nonCachedNodes = [];

        nodes.forEach(function(node) {
            var entry = nodeToBindings.getItem(node.toString());
            if (entry == null) {
                nonCachedNodes.push(node);
            } else {
                cachedNodes.push(node);
            }
        });

        var maxChunkSize = this.maxChunkSize;

        var nonCachedChunks = [];
        for (var i = 0; i < nonCachedNodes.length; i += maxChunkSize) {
            var chunk = nodes.slice(i, i + maxChunkSize);

            nonCachedChunks.push(chunk);
        }

        var result = {
            cachedNodes: cachedNodes,
            nonCachedNodes: nonCachedNodes,
            nonCachedChunks: nonCachedChunks,
            maxChunkSize: maxChunkSize,
        };

        return result;
    },
});

module.exports = QueryCacheBindingHashSingle;
