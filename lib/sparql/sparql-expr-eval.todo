(function() {
	
	var ns = Jassa.sparql;
	

	ns.evaluators = {
		'&&': function() {
			
		}
			
	};
	
	
	ns.ExprEvaluator = Class.create({
	   eval: function(expr, binding) {
	       throw 'Not overridden';
	   } 
	});
	

	ns.ExprEvaluatorImpl = Class.create(ns.ExprEvaluator, {
		
		eval: function(expr, binding) {
			
			var result;

			if(expr.isVar()) {
				var e = expr.getExprVar();
				result = this.evalExprVar(e, binding);
			}
			else if(expr.isFunction()) {
				var e = expr.getFunction();
				result = this.evalExprFunction(e, binding);
			}
			else if(expr.isConstant()) {
				var e = expr.getConstant();
        // FIXME: this.evalConstant not defined
				result = this.evalConstant(e, binding);
			}
			else {
				throw 'Unsupported expr type';
			}
			
			return result;
		},
		

		evalExprVar: function(expr, binding) {
			//console.log('Expr' + JSON.stringify(expr));
			var v = expr.asVar();
			
			var node = binding.get(v);
			
			var result;
			if(node == null) {
				//console.log('No Binding for variable "' + v + '" in ' + expr + ' with binding ' + binding);
				//throw 'Bailing out';
			    return ns.NodeValue.nvNothing;
			    //return null;
			} else {
				result = ns.NodeValue.makeNode(node);
			}
			
			return result;
		},

		
		evalExprFunction: function(expr, binding) {
			
		},

		evalNodeValue: function(expr, binding) {
		}

	});

	
})();