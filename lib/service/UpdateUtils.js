var QuadUtils = require('../sparql/QuadUtils');
var UpdateDataInsert = require('../sparql/update/UpdateDataInsert');
var UpdateDataDelete = require('../sparql/update/UpdateDataDelete');
var PromiseUtils = require('../util/PromiseUtils');

// TODO createInsertRequest and createDeleteRequest might be better suited for the sparql module
var UpdateUtils = {
    performUpdate: function(updateService, diff, graphNode, prefixMapping) {

        var ps = [];
        var p;

        // TODO: Create a single MODIFY statement
        var str1 = UpdateUtils.createDeleteRequest(diff.removed, graphNode, prefixMapping);
        if(str1) {
            p = updateService.createUpdateExecution(str1).execUpdate();
            ps.push(p);
        }

        var str2 = UpdateUtils.createInsertRequest(diff.added, graphNode, prefixMapping);
        if(str2) {
            p = updateService.createUpdateExecution(str2).execUpdate();
            ps.push(p);
        }

        var result = PromiseUtils.all(ps);
        return result;
    },

    createInsertRequest: function(graph, graphNode, prefixMapping) {
        var result;
        if(graph && !graph.isEmpty()) {
            var quads = QuadUtils.triplesToQuads(graph, graphNode);
            result = '' + new UpdateDataInsert(quads);
        } else {
            result = null;
        }
        return result;
    },

    createDeleteRequest: function(graph, graphNode, prefixMapping) {
        var result;
        if(graph && !graph.isEmpty()) {
            var quads = QuadUtils.triplesToQuads(graph, graphNode);
            result = '' + new UpdateDataDelete(quads);
        } else {
            result = null;
        }
        return result;
    }
};

module.exports = UpdateUtils;

