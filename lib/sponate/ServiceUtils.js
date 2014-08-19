
var ServiceUtils = {
    processResultSet: function(rs, acc) {
        
        while(rs.hasNext()) {
            var binding = rs.next();
            acc.accumulate(binding);
        }
        
        var result = acc.getValue();
        return result;
    },

    processBindings: function(bindings, acc) {
        bindings.forEach(function(binding) {
            acc.accumulate(binding);
        });
        
        var result = acc.getValue();
        return result;
    },
    
    execAgg: function(sparqlService, query, agg) {
        var acc = agg.createAcc();
        var result = this.execAcc(sparqlService, query, acc);
        return result;
    },
    
    execAcc: function(sparqlService, query, acc) {
        var qe = sparqlService.createQueryExecution(query);
        var result = qe.execSelect().then(function(rs) {
            var r = ServiceUtils.processResultSet(rs, acc);
            return r;
        });
        
        return result;
    }
};

module.exports = ServiceUtils;
