(function() {

    var util = Jassa.util;
    var sparql = Jassa.sparql;

    var ns = Jassa.service;


    // TODO Move to some other place
    ns.createNgGridOptionsFromQuery = function(query) {
        if(!query) {
            return [];
        }
        
        var projectVarList = query.getProjectVars().getVarList();
        var projectVarNameList = sparql.VarUtils.getVarNames(projectVarList);

        var result = _(projectVarNameList).map(function(varName) {
            var col = {
                field: varName,
                displayName: varName
            };
                
            return col;
        });
        
        return result;
    };
    
    ns.bindingToJson = function(varList, binding) {
        var result = {};
        
        _(varList).each(function(v) {
            var varName = v.getName();
            result[varName] = '' + binding.get(v);
        });

        return result;
    };


    ns.SparqlTableService = Class.create({
        /**
         * TODO Possibly add primaryCountLimit - i.e. a limit that is never counted beyond, even if the backend might be fast enough
         */
        initialize: function(sparqlService, query, timeoutInMillis, secondaryCountLimit) {
            this.sparqlService = sparqlService;
            this.query = query;
            this.timeoutInMillis = timeoutInMillis || 3000;
            this.secondaryCountLimit = secondaryCountLimit || 1000;
        },
        
        fetchCount: function() {
            if(!this.query) {
                var deferred = jQuery.Deferred();
                deferred.resolve(0);
                return deferred.promise();
            }
            
            var query = this.query.clone();

            query.setLimit(null);
            query.setOffset(null);
  
            var result = ns.ServiceUtils.fetchCountQuery(this.sparqlService, this.query, this.timeoutInMillis, this.secondaryCountLimit);
          
/*
            var countVar = rdf.NodeFactory.createVar('_c_');
            var countQuery = createQueryCountQuery(query, countVar);
            var countQe = this.sparqlService.createQueryExecution(countQuery);
            var promise = service.ServiceUtils.fetchInt(countQe, countVar);
*/
            
            //console.log('Count Query: ' + countQuery);

            //return promise;
            return result;
        },
        
        fetchData: function(limit, offset) {
            if(!this.query) {
                var deferred = jQuery.Deferred();

                var itBinding = new util.IteratorArray([]);
                var varNames = [];
                var rs = new ns.ResultSetArrayIteratorBinding(itBinding, varNames);
               
                
                deferred.resolve(rs);
                return deferred.promise();
            }

            
            var query = this.query.clone();

            query.setLimit(limit);
            query.setOffset(offset);
            
            var qe = this.sparqlService.createQueryExecution(query);

            var result = qe.execSelect().pipe(function(rs) {
                var data = [];
                
                var projectVarList = query.getProjectVars().getVarList();
                
                while(rs.hasNext()) {
                    var binding = rs.next();
                    
                    var o = ns.bindingToJson(projectVarList, binding);
                    
                    data.push(o);
                }
                
                return data;
            });
            
            return result;
        },
        
        getSchema: function() {
            var query = this.query;

            //var projectVarList = query.getProjectVars().getVarList();
            //var projectVarNameList = sparql.VarUtils.getVarNames(projectVarList);

            var colDefs = ns.createNgGridOptionsFromQuery(query);
            
            
            return colDefs;
        }
    });

})();

