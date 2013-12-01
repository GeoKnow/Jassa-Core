(function() {
	
    var sparql = Jassa.sparql;
    
    
	var ns = Jassa.sponate;


	ns.CriteriaCompilerSparql = Class.create({


		/**
		 * The result is a joinNode (can be converted to an element)....
		 * 
		 * So maybe the result is simply a list of sparq.Elements that correspond to the criteria.
		 * 
		 */
		compile: function(context, mapping, criteria) {
		    
		    var tableName = mapping.getTableName();
		    var tableNameToElement = context.getTableNameToElement();
		    var element = tableNameToElement[tableName];
		    		    
		    var joinNode = sparql.JoinBuilderElement.create(element);
		    
		    //var result = []; // list of elements
		    
//		    var result = {
//		            exprs: [];
//		    }
		    
		    // TODO The result format is still unclear ; most likely it is
		    // something along the lines of a mapping from
		    // join alias to exprs and elements
		    result = [];
		    
            console.log("Compile request for criteria: " + criteria + '; ' + JSON.stringify(criteria));

            var pattern = mapping.getPattern();

		    criteria.accept(this, pattern, context, joinNode, result);
		    
            return result;
            
//		    var alias = joinNode.getAlias();
//
//		    var joinBuilder = joinNode.getJoinBuilder();
//		    var aliasToVarMap = joinBuilder.getAliasToVarMap();

		    
		    
//		    var foo = joinNode.join([vs], b, [vs]);
//		    //var bar = foo.join([vl], b, [vs]);
//		    joinNode.join([vs], a, [vl]);
//
//		    var joinBuilder = foo.getJoinBuilder();
//		    var elements = joinBuilder.getElements();
//		    var els = new sparql.ElementGroup(elements);
//		    var aliasToVarMap = joinBuilder.getAliasToVarMap();
//		    
//		    
//		    var rowMapper = new sponate.RowMapperAlias(aliasToVarMap);
//		    var aliasToBinding = rowMapper.map(binding);
		    
//		    console.log('Final Element: ' + els);
//		    console.log('Var map:',  aliasToVarMap);
//		    console.log('Alias to Binding: ', JSON.stringify(aliasToBinding));

		    
		    
//			var joinGraph = new ns.Graph(ns.fnCreateMappingJoinNode, ns.fnCreateMappingEdge);
//			
//			var joinNode = joinGraph.createNode(mapping);
//			var result = criteria.accept(this, criteria, context, joinGraph, joinNode);
//
//			return result;
		    
		},
		
		
//		findPattern: function(pattern, attrPath) {
//
//			// At each step check whether we encounter a reference
//			_(attrPath.getSteps()).each(function(step) {
//				pattern.f
//			});
//		},
//		
		
		visitElemMatch: function(criteria, pattern, context, joinNode, result) {
//          debugger;
            var subPattern = pattern.findPattern(criteria.getAttrPath());
            
            var self = this;
            var subCriterias = criteria.getCriterias();
            var orExprs = [];
            
            _(subCriterias).each(function(subCriteria) {
                var andExprs = [];
                subCriteria.accept(self, subPattern, context, joinNode, andExprs);
                
                var andExpr = sparql.andify(andExprs);
                orExprs.push(andExpr);
            });

            var orExpr = sparql.orify(orExprs);
            result.push(orExpr);
		},

		
		getExpr: function(pattern) {
            if(pattern instanceof ns.PatternLiteral) {
                var expr = pattern.getExpr();
                
                return expr;
                //var element = new sparql.ElementFilter([e]);
            } else {
                console.log('[ERROR] pattern type not supported yet');
                throw 'Bailing out';
            }
		    
		},
		
		visitEq: function(criteria, pattern, context, joinNode, result) {
//            debugger;
            var subPattern = pattern.findPattern(attrPath);

            var expr = this.getExpr(subPattern);
            var e = new sparql.E_Equals(new sparql.E_Str(expr), sparql.NodeValue.makeString(ap.getValue()));
            result.push(e);
		},
		
		visitCriteria$and: function(criteria, pattern, context, joinNode, result) {
//            debugger;
		    console.log('Pattern: ' + pattern);
            var subPattern = pattern.findPattern(criteria.getAttrPath());
		    
		    
            var self = this;
		    var subCriterias = criteria.getCriterias();
		    _(subCriterias).each(function(subCriteria) {
	            criteria.accept(self, subPattern, context, joinNode, result);
		    });
		},

		visitCriteria$or: function(criteria, pattern, context, joinNode, result) {
//            debugger;
            var subPattern = pattern.findPattern(criteria.getAttrPath());

            
		    var self = this;
            var subCriterias = criteria.getCriterias();
            var orExprs = [];
            
            _(subCriterias).each(function(subCriteria) {
                var andExprs = [];
                subCriteria.accept(self, subPattern, context, joinNode, andExprs);
                
                var andExpr = sparql.andify(andExprs);
                orExprs.push(andExpr);
            });

            var orExpr = sparql.orify(orExprs);
            result.push(orExpr);
        },

        visitCriteria$regex: function(criteria, pattern, context, joinNode, result) {
//            debugger;
            var subPattern = pattern.findPattern(criteria.getAttrPath());

            var regexStr = criteria.getRegex().toString().slice(1, -1);
            var expr = this.getExpr(subPattern);
            var e = new sparql.E_Regex(new sparql.E_Str(expr), regexStr);
            result.push(e);
        },
		
		/**
		 * 
		 * 
		 */
		visitRef: function(criteria, context, graph, joinNode) {
			
		},


		visitGt: function() {

		},
		
		
	});
	
	
})();