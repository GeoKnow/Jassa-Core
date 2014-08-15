
    ns.ResultSetUtils = {
        partition: function(rs, v) {
            var varNames = rs.getVarNames();
            //var result = {};
            var result = new util.HashMap();
            
            while(rs.hasNext()) {
                var binding = rs.next();
                var val = binding.get(v);
                
                var rsp = result.get(val);
                if(rsp == null) {
                    rsp = new service.ResultSetPart(varNames);
                    result.put(val, rsp);
                }
                
                rsp.getBindings().push(binding);
            }
            
            return result;
        },

        createResultSetFromBindings: function(bindings, varNames) {
            var it = new util.IteratorArray(bindings);
            var result = new service.ResultSetArrayIteratorBinding(it, varNames);
            
            return result;
        },
        
        createEmptyResultSet: function(query) {
            var vars = query.getProjectVars();
            var varNames = sparql.VarUtils.getVarNames(vars);
            
            var result = this.createResultSetFromBindings([], varNames);
            return result;
        }
    };
    