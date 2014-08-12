var uniq = require('lodash.uniq');
var VarUtils = require('../../sparql/var-utils');
var ServiceUtils = require('../service-utils');
var IteratorArray = require('../../util/iterator-array');
var ResultSetArrayIteratorBinding = require('../result-set').ArrayIteratorBinding;
var Promise = require('bluebird');

var TableServiceUtils = {
    bindingToJsMap: function(varList, binding) {
        var result = {};

        varList.forEach(function(v) {
            var varName = v.getName();
            // result[varName] = '' + binding.get(v);
            result[varName] = binding.get(v);
        });

        return result;
    },

    createNgGridOptionsFromQuery: function(query) {
        if (!query) {
            return [];
        }

        var projectVarList = query.getProjectVars(); // query.getProjectVars().getVarList();
        var projectVarNameList = VarUtils.getVarNames(projectVarList);

        var result = projectVarNameList.map(function(varName) {
            var col = {
                field: varName,
                displayName: varName,
            };

            return col;
        });

        return result;
    },

    fetchCount: function(sparqlService, query, timeoutInMillis, secondaryCountLimit) {
        var result;
        if (!sparqlService || !query) {
            result = new Promise(function(resolve) {
                resolve(0);
            });
        } else {
            query = query.clone();

            query.setLimit(null);
            query.setOffset(null);

            result = ServiceUtils.fetchCountQuery(sparqlService, query, timeoutInMillis, secondaryCountLimit);
        }

        return result;
    },

    fetchData: function(sparqlService, query, limit, offset) {
        if (!sparqlService || !query) {
            var itBinding = new IteratorArray([]);
            var varNames = [];
            var rs = new ResultSetArrayIteratorBinding(itBinding, varNames);

            return new Promise(function(resolve) {
                resolve(rs);
            });
        }

        // Clone the query as to not modify the original object
        query = query.clone();

        query.setLimit(limit);
        query.setOffset(offset);

        var qe = sparqlService.createQueryExecution(query);

        var result = qe.execSelect().then(function(rs) {
            var data = [];

            var projectVarList = query.getProjectVars(); // query.getProjectVars().getVarList();

            while (rs.hasNext()) {
                var binding = rs.next();

                var o = TableServiceUtils.bindingToJsMap(projectVarList, binding);

                data.push(o);
            }

            return data;
        });

        return result;
    },

    collectNodes: function(rows) {
        // Collect nodes
        var result = [];
        rows.forEach(function(item) {
            item.forEach(function(node) {
                result.push(node);
            });
        });

        result = uniq(result, false, function(x) {
            return x.toString();
        });

        return result;
    },

    fetchSchemaTableConfigFacet: function(tableConfigFacet, lookupServicePathLabels) {
        var paths = tableConfigFacet.getPaths().getArray();

        // We need to fetch the column headings
        var promise = lookupServicePathLabels.lookup(paths);

        var result = promise.then(function(map) {

            var colDefs = paths.map(function(path) {
                var r = {
                    field: tableConfigFacet.getColumnId(path),
                    displayName: map.get(path),
                    path: path,
                };
                return r;
            });

            var r = {
                colDefs: colDefs,
            };

            return r;
        });

        return result;
    },

    // rows is expected to be a List<Map<String, Node>>
    transformToNodeLabels: function(lookupServiceNodeLabels, rows) {

        var nodes = this.collectNodes(rows);

        // Get the node labels
        var p = lookupServiceNodeLabels.lookup(nodes);

        // Transform every node
        var result = p.then(function(nodeToLabel) {
            var r = rows.map(function(row) {
                var r = {};
                row.forEach(function(node, key) {
                    var label = nodeToLabel.get(node);
                    r[key] = {
                        node: node,
                        displayLabel: label,
                    };
                });
                return r;
            });
            return r;
        });

        return result;
    },
};

module.exports = TableServiceUtils;
