var union = require('lodash.union');
var defaults = require('lodash.defaults');

var ResultSetArrayIteratorBinding = require('./result-set').ArrayIteratorBinding;

var ArrayUtils = require('../util/array-utils');
var IteratorArray = require('../util/iterator-array');

var ExprVar = require('../sparql/expr-var');
var ElementFilter = require('../sparql/element-filter');
var E_OneOf = require('../sparql/e-one-of');
var ElementSubQuery = require('../sparql/element-sub-query');
var VarUtils = require('../sparql/var-utils');
var Binding = require('../sparql/binding');

// FIXME: depends on facete - what to do?
var ConceptUtils = {}; //require('../facete/concept-utils');
var QueryUtils = {}; //require('../facete/query-utils');

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
        var result = chunks.map(function(chunk) {
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
        
        var masterTask = $.when.apply(window, promises);
        
        var self = this;
        var result = masterTask.pipe(function(/* arguments will be result sets */) {
            var r = self.mergeResultSets(arguments);
            return r;
        });

        return result;
    },
        
    /**
     * TODO Rather use .close()
     * 
     * @param rs
     * @returns
     */
    consumeResultSet: function(rs) {
        while(rs.hasNext()) {
            rs.nextBinding();
        }
    },
        
    resultSetToList: function(rs, variable) {
        var result = [];
        while(rs.hasNext()) {
            var binding = rs.nextBinding();

            var node = binding.get(variable);
            result.push(node);
        }
        return result;
    },
        
    // TODO: If there is only one variable in the rs, use it.
    resultSetToInt: function(rs, variable) {
        var result = null;

        if(rs.hasNext()) {
            var binding = rs.nextBinding();

            var node = binding.get(variable);
            
            // TODO Validate that the result actually is int.
            result = node.getLiteralValue();
        }
        
        return result;
    },

    
    fetchList: function(queryExecution, variable) {
        var self = this;
        var result = queryExecution.execSelect().pipe(function(rs) {
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
        var result = queryExecution.execSelect().pipe(function(rs) {
            var r = self.resultSetToInt(rs,variable);
            return r;
        });

        return result;
    },
    
    fetchCountConcept: function(sparqlService, concept, threshold) {

        var outputVar = ConceptUtils.createNewVar(concept);
        
        var scanLimit = threshold === null ? null : threshold + 1;
        
        var countQuery = ConceptUtils.createQueryCount(concept, outputVar, scanLimit);
        //var result = ns.ServiceUtils.fetchCountQuery(sparqlService, query, outputVar);

        var qe = sparqlService.createQueryExecution(countQuery);
//            qe.setTimeout(firstTimeoutInMs);
        
        var deferred = $.Deferred();
        var p1 = ServiceUtils.fetchInt(qe, outputVar); 
        p1.done(function(count) {
            
            var hasMoreItems = count > threshold;
            
            var r = {
                count: hasMoreItems ? threshold : count,
                limit: threshold,
                hasMoreItems: hasMoreItems
            };
            
            deferred.resolve(r);

        }).fail(function() {
            deferred.fail();
        });
        
        return deferred.promise();
    },
    
    
    /**
     * Count the results of a query, whith fallback on timeouts
     * 
     * Attempt to count the full result set based on firstTimeoutInMs
     * 
     * if this fails, repeat the count attempt using the scanLimit
     * 
     * TODO Finish
     */
    fetchCountQuery: function(sparqlService, query, firstTimeoutInMs, limit) {
        
        var elements = [new ElementSubQuery(query)];
        
        var varsMentioned = query.getVarsMentioned();
        
        var varGen = VarUtils.createVarGen('c', varsMentioned);

        var outputVar = varGen.next();
        //var outputVar = rdf.NodeFactory.createVar('_cnt_');
        
        //createQueryCount(elements, limit, variable, outputVar, groupVars, useDistinct, options)
        var countQuery = QueryUtils.createQueryCount(elements, null, null, outputVar, null, null, null);
        
        var qe = sparqlService.createQueryExecution(countQuery);
        qe.setTimeout(firstTimeoutInMs);
        
        var deferred = $.Deferred();
        var p1 = ServiceUtils.fetchInt(qe, outputVar); 
        p1.done(function(count) {
            
            deferred.resolve({
                count: count,
                limit: null,
                hasMoreItems: false
            });

        }).fail(function() {

            // Try counting with the fallback size
            var countQuery = QueryUtils.createQueryCount(elements, limit + 1, null, outputVar, null, null, null);                
            var qe = sparqlService.createQueryExecution(countQuery);
            var p2 = ServiceUtils.fetchInt(qe, outputVar); 
            p2.done(function(count) {
                                    
                deferred.resolve({
                    count: count,
                    limit: limit,
                    hasMoreItems: count > limit
                });             
            }).fail(function() {
               deferred.fail(); 
            });             

        });
        
        var result = deferred.promise();
        return result;
    },

    
    //ns.globalSparqlCacheQueue = [];
    
    /**
     * 
     * @param baseURL
     * @param query
     * @param callback
     * @param format
     */
    createSparqlRequestAjaxSpec: function(baseUrl, defaultGraphIris, queryString, dataDefaults, ajaxDefaults) {
        var data = {
            'query': queryString,
            'default-graph-uri': defaultGraphIris
        };

        var result = {
            url: baseUrl,
            dataType: 'json',
            crossDomain: true,
            traditional: true,
            data: data
        };
        
        defaults(data, dataDefaults);
        defaults(result, ajaxDefaults);
        
        return result;
    },
    
       // TODO Maybe move to a conversion utils package.
    jsonToResultSet: function(json) {
    
        var varNames = json.head.vars;
        var bindings = json.results.bindings;
    
        var tmp = bindings.map(function(b) {
            var bindingObj = Binding.fromTalisJson(b);
            return bindingObj;                  
        });
        
        var itBinding = new IteratorArray(tmp);
        
        var result = new ResultSetArrayIteratorBinding(itBinding, varNames);
        return result;
    }
};

module.exports = ServiceUtils;
