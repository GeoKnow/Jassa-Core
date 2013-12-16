(function() {
	
    var util = Jassa.util;
    var sparql = Jassa.sparql;
    
    var ns = Jassa.service;
    
    
    // Select ?a (Sum(b) As ?c) { ?a ?b ?c } --- joinCond: ?a ?c
    
    // getVarsMentioned() vs getVarsProvided()
    
    ns.Buffer = Class.create({
        isFull: function() {
            throw 'Not overridden';
        }
    });
    
    ns.BufferSet = Class.create(ns.Buffer, {
        initialize: function(maxItemCount) {
            this.data = new util.SetList();
            this.maxItemCount = maxItemCount;
        },
        
        add: function(item) {
            if(this.isFull()) {
                throw 'Buffer was full with ' + this.maxItemCount + ' items; Could not add item ' + item;
            }
            
            this.data.add(item);
        },
        
        isFull: function() {
            var result = this.data.size() >= this.maxItemCount;
            return result;
        },
        
        clear: function() {
            this.data.clear();
        },
        
        entries: function() {
            
        }
    });
    

    
    ns.BindingLookup = Class.create({
        initialize: function(sparqlService, element, joinExprs) {
            this.sparqlService = sparqlService;
            this.element = element;
            //this.joinExprs = joinExprs;
            // array of exprs - implicitly anded
            // if joinExprs is null, the bindings are used as constraints directly
            
            //this.exprSubstitutor = new sparql.ExprSubstitutor();
        },
        
        lookupByIterator: function(itBindings) {
            
            // Each binding (in order) maps to the join expr,
            // Each join expr maps to its corresponding set of bindings
            // MapList<Binding, MapList<Expr
   
            //var buffer = new util.Buffer(30);

            var bindingToExprs = [];
            
            while(itBindings.hasNext()) {
                var binding = itBindings.nextBinding();

//                var exprs = this.joinExprs.map(function(expr) {
//                    var r = sparql.ExprUtils.copySubstitute(joinExprs, binding);
//                    return r;
//                });
                
                
                var exprs = sparql.ExprUtils.bindingToExprs(binding);
                var exprsKey = exprs.join(', ');
                
                bindingToExprs.push({
                    binding: binding,
                    exprs: exprs,
                    exprsKey: exprsKey
                });
            }
            
            var elementFilter = new sparql.ElementFilter(expr);
            
//            var filteredElement = new sparql.ElementGroup([
//                this.element,
//                elementFilter
//            ]);

            var subQuery = this.query.clone();
            subQuery.getElements().push(elementFilter);
            
            // TODO: Add columns for variables in B
            
            var rsB = this.sparqlService.execSelect(subQuery);
            
            
        }
    });
    
    
    ns.ResultSetHashJoin = Class.create(util.IteratorAbstract, {
        // Expression must be expressed in terms of variable appearing in (the bindings of) rsA and elementB
        /**
         * 
         * Example:
         *   Given the condition (?a < ?b) with ?a being provided by rsA, and elementB = {?x numberOfSeats ?b}
         *   Then the buffer will be filled with values of (?a), such as [1, 2, 3, 4, 5]...
         *   For each value in the buffer, we create an element {?x numberOfSeats ?b . Filter(?b < 1 ||  ?b < 2 || ?b < 3 ...) }
         * 
         * TODO Combine serviceB and elementB into 'thingWhereWeCanLookupTuplesByBindings'
         */
        initialize: function(rsA, serviceB, elementB, expr) {
            this.rsA = rsA;
            this.serviceB = serviceB;
            this.elementB = elementB;
            this.expr = expr;
            
            rsA.getVarsMentioned();
            expr.getVarsMentioned();
        },
        
        $prefetch: function() {
            var maxBufferSize = 20;
            var buffer = []
            
            
            // Fill the buffer
            while(rsA.hasNext()) {
            
                
            }
            
            // If either the buffer is full or there are no more bindings in rsa,
            // Execute the join
            if(buffer.isFull() || !rsa.hasNext()) {
                
            }
            
        } 
    });
    
    
	var QueryExecutionUtils  = {
	    /**
	     * Given a result set rsA, and elementB, an serviceB and a condition on which
	     * to join
	     * 
	     */
	    createResultSetJoinHash: function(rsA, serviceB, elementB, expr) {
	        
	    },
	    
	    
	        
		execJoin: function(sparqlService, elementA, elementB, expr) {
			
		}
	};

//	var QepJoinFetchRight = Class.create({
//		initialize: function(lhs, rhs) {
//			
//		}
//	});
	
})();