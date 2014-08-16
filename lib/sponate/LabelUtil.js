    

    

    
    

    
    //var aggLabel = new ns.AggLabel(prefLabelPropertyUris, prefLangs, labelExpr, subjectExpr, propertyExpr);


    //var aggFactoryLabel = new ns.AggFactoryLabel(prefLabelPropertyUris, prefLangs, labelExpr, subjectExpr, propertyExpr);

    
    ns.LabelUtil = Class.create({
        initialize: function(aggFactory, element) {
            this.aggFactory = aggFactory;
            this.element = element;
        },
        
        getAggFactory: function() {
            return this.aggFactory;
        },
        
        getElement: function() {
            return this.element;
        }
    });

    ns.LabelUtilFactory = Class.create({
       initialize: function(prefLabelPropertyUris, prefLangs) {
           this.prefLabelPropertyUris = prefLabelPropertyUris;
           this.prefLangs = prefLangs;
           
           // TODO Add option fetchAllLangs (prevent fetching only desired langs - may have performance bonus on lang switches)
           // TODO Add option prefPropertyOverLang (by default, the language is more important than the property)
           
           this.prefLabelProperties = _(this.prefLabelPropertyUris).map(function(uri) {
              return rdf.NodeFactory.createUri(uri); 
           });
       },
       
       createLabelUtil: function(labelVarName, subjectVarName, propertyVarName) {
            var s = rdf.NodeFactory.createVar(subjectVarName);
            var p = rdf.NodeFactory.createVar(propertyVarName);
            var o = rdf.NodeFactory.createVar(labelVarName);

            var subjectExpr = new sparql.ExprVar(s);
            var propertyExpr = new sparql.ExprVar(p);
            var labelExpr = new sparql.ExprVar(o);

            // First, create the aggregator object
            var aggFactoryLabel = new ns.AggFactoryLabel(this.prefLabelPropertyUris, this.prefLangs, labelExpr, subjectExpr, propertyExpr);
        
            
            // Second, create the element
            var langTmp = _(this.prefLangs).map(function(lang) {
                var r = new sparql.E_LangMatches(new sparql.E_Lang(labelExpr), sparql.NodeValue.makeString(lang));
                return r;
            });
                
            // Combine multiple expressions into a single logicalOr expression.
            var langConstraint = sparql.orify(langTmp);
            
            //var propFilter = new sparql.E_LogicalAnd(
            var propFilter = new sparql.E_OneOf(propertyExpr, this.prefLabelProperties);
            //);
            
            var els = [];
            els.push(new sparql.ElementTriplesBlock([ new rdf.Triple(s, p, o)] ));
            els.push(new sparql.ElementFilter(propFilter));
            els.push(new sparql.ElementFilter(langConstraint));
            
            var langElement = new sparql.ElementGroup(els);
            
            var result = new ns.LabelUtil(aggFactoryLabel, langElement);
            return result;
       }
    });

    
    
})();
