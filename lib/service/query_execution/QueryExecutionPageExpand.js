var Class = require('../../ext/Class');
var QueryExecutionDelegate = require('./QueryExecutionDelegate');
var PageExpandUtils = require('../PageExpandUtils');
var IteratorArray = require('../../util/collection/IteratorArray');
var ResultSetArrayIteratorBinding = require('../result_set/ResultSetArrayIteratorBinding');

var QueryExecutionPageExpand = Class.create(QueryExecutionDelegate, {
    initialize: function($super, sparqlService, query, pageSize) {
        $super(sparqlService, query);
        this.pageSize = pageSize;
    },

    /**
     * Send the query, and only return the subset result set in the given sub range.
     *
     */
    execSelect: function() {
        var q = this.query.clone();
        var x = PageExpandUtils.computeRange(q.getLimit(), q.getOffset(), this.pageSize);

        q.setLimit(x.limit);
        q.setOffset(x.offset);

        var qe = this.createQueryExecution(q);
        var p = qe.execSelect();
        var result = p.then(function(rs) {
            var bindings = rs.getIterator().getArray();

            var end = x.subLimit ? x.subOffset + x.subLimit : bindings.length;
            var subBindings = bindings.slice(x.subOffset, end);

            var varNames = rs.getVarNames();
            var it = new IteratorArray(subBindings);
            var r = new ResultSetArrayIteratorBinding(it, varNames);

            return r;
        });

        return result;
    }
});

module.exports = QueryExecutionPageExpand;
