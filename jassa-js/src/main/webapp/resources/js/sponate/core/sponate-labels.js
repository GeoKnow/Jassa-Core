(function() {

    var rdf = Jassa.rdf;
    var sparql = Jassa.sparql;
    
    var ns = Jassa.sponate;
    
    var compareArray = function(as, bs, op) {
        var zipped = _.zip(as, bs);
        
        var result = false;
        for(var i = 0; i < zipped.length; ++i) {
           var item = zipped[i];
           var a = item[0];
           var b = item[1];
           
           if(op(a, b)) {
               if(op(b, a)) {
                   continue;
               }
               
               result = true;
               break;
           } else { //else if(op(b, a)) {
               if(!op(b, a)) {
                   continue;
               }

               result = false;
               break;
           }
        }
//         _(zipped).each(function(item) {
            
//         });
        
//      var result = zipped.every(function(a) {
//          var r = op(a[0], a[1]);
//          return r;
//      });
       
        return result;
    };
    
    var cmpLessThan = function(a, b) {
        return a < b;
    };
    
    // TODO Move to utils
    ns.extractLabelFromUri = function(str) {
        var a = str.lastIndexOf('#');
        var b = str.lastIndexOf('/');
        
        var i = Math.max(a, b);

        var result = (i == str.length) ? str : str.substring(i + 1); 

        return result;
    }
    
    ns.AggregatorFactoryLabel = Class.create({
        initialize: function(labelPrios, prefLangs, labelExpr, subjectExpr, propertyExpr) {
            this.labelPrios = labelPrios;
            this.prefLangs = prefLangs;
            this.labelExpr = labelExpr;
            this.subjectExpr = subjectExpr;
            this.propertyExpr = propertyExpr;
        },
        
        createAggregator: function() {
            var result = new ns.AggregatorLabel(
                this.labelPrios, this.prefLangs, this. labelExpr, this.subjectExpr, this.propertyExpr
            );
            return result;
        },
        
        getVarsMentioned: function() {
            var vm = (function(expr) {
                var result = expr ? expr.getVarsMentioned() : [];
                return result;
            });
            
            var result = _.union(vm(this.labelExpr), vm(this.subjectExpr), vm(this.propertyExpr));
            return result;
        }
    });
    
    
    ns.AggregatorLabel = Class.create({
        initialize: function(labelPrios, prefLangs, labelExpr, subjectExpr, propertyExpr) {
            this.subjectExpr = subjectExpr;
            this.propertyExpr = propertyExpr;
            this.labelExpr = labelExpr;
            

            //this.exprEvaluator = exprEvaluator ? exprEvaluator : new sparql.ExprEvaluatorImpl();
            this.exprEvaluator = new sparql.ExprEvaluatorImpl();
            
            this.labelPrios = labelPrios;
            this.prefLangs = prefLangs;

            //this.defaultPropery = defaultProperty;
            
            this.bestMatchNode = null;
            this.bestMatchScore = [1000, 1000];
        },
        
        processBinding: function(binding) {
            
            // Evaluate label, property and subject based on the binding
            var property = this.exprEvaluator.eval(this.propertyExpr, binding);
            var label = this.exprEvaluator.eval(this.labelExpr, binding);
            var subject = this.exprEvaluator.eval(this.subjectExpr, binding);
           
            
            // Determine the score vector for the property and the language
            var propertyScore = -1;
            var langScore;
            
            var l;
            if(property && property.isConstant()) {
                var p = property.getConstant().asNode();
                if(p.isUri()) {
                    var propertyUri = p.getUri();
                    propertyScore = this.labelPrios.indexOf(propertyUri);
                }
            }
            
            if(label && label.isConstant()) {
                l = label.getConstant().asNode();
                
                var lang = l.isLiteral() ? l.getLiteralLanguage() : 'nolang';
                
//              var val = l.getLiteralLexicalForm();

//              if(val == 'Foobar' || val == 'Baz') {
//                  console.log('here');
//              }

                
                langScore = this.prefLangs.indexOf(lang);
            }
            
            
            var score = [propertyScore, langScore];
            
            var allNonNegative = _(score).every(function(item) {
                return item >= 0;
            });
            
            if(allNonNegative) {
            
                // Check if the new score is better (less than) than the current best match
                var cmp = compareArray(score, this.bestMatchScore, cmpLessThan);
                if(cmp === true) {
                    this.bestMatchScore = score;
                    this.bestMatchNode = l;
                }
            }
        },
        
        getNode: function() {
            return this.bestMatchNode;  
        },
        
        getJson: function() {
            var result = null;
            if(this.bestMatchNode) {
                result = this.bestMatchNode.getLiteralValue();
            }

            return result;
        }
    });
    
    //var aggLabel = new ns.AggregatorLabel(prefLabelPropertyUris, prefLangs, labelExpr, subjectExpr, propertyExpr);


    //var aggFactoryLabel = new ns.AggregatorFactoryLabel(prefLabelPropertyUris, prefLangs, labelExpr, subjectExpr, propertyExpr);

    
    ns.LabelUtil = Class.create({
        initialize: function(aggFactory, element) {
            this.aggFactory = aggFactory
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
            var aggFactoryLabel = new ns.AggregatorFactoryLabel(this.prefLabelPropertyUris, this.prefLangs, labelExpr, subjectExpr, propertyExpr);
        
            
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
            els.push(new sparql.ElementFilter([propFilter]));
            els.push(new sparql.ElementFilter([langConstraint]));
            
            var langElement = new sparql.ElementGroup(els);
            
            var result = new ns.LabelUtil(aggFactoryLabel, langElement);
            return result;
       }
    });

    
    
})();
