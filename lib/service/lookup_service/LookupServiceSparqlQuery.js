    ns.LookupServiceSparqlQuery = Class.create(ns.LookupServiceBase, {
        initialize: function(sparqlService, query, v) {
            this.sparqlService = sparqlService;
            this.query = query;
            this.v = v;
        },

        /**
         * @param uris An array of rdf.Node objects that represent URIs
         */
        lookup: function(uris) {
            var v = this.v;
            var result;
            if(uris.length === 0) {
                result = jQuery.Deferred();
                result.resolve(new util.HashMap());
            } else {
                var q = this.query.clone();

                var filter = new sparql.ElementFilter(new sparql.E_OneOf(new sparql.ExprVar(v), uris));

                var element = new sparql.ElementGroup([q.getQueryPattern(), filter]);
                q.setQueryPattern(element);

                var qe = this.sparqlService.createQueryExecution(q);
                result = qe.execSelect().pipe(function(rs) {
                    var r = ns.ResultSetUtils.partition(rs, v);
                    return r;
                });

                return result;
            }
        }
    });