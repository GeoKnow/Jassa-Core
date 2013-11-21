(function() {

	var ns = Jassa.service;
	
	ns.ServiceUtils = {
	
		/**
		 * TODO Rather use .close()
		 * 
		 * @param rs
		 * @returns
		 */
		consumeResultSet: function(rs) {
			while(rs.hasNext()) {
				rs.nextBinding();
			};
		},
			
		resultSetToList: function(rs) {
			var result = [];
			while(rs.hasNext()) {
				var binding = rs.nextBinding();

				var node = binding.get(variable);
				result.push(node);
			}
			return result;
		},
			
		
		resultSetToInt: function(rs) {
			var result = null;

			if(rs.hasNext()) {
				var binding = rs.nextBinding();

				var node = binding.get(variable);
				
				// TODO Validate that the result actually is int.
				result = node.getLiteralValue();
			}
			
			return result;
		},

		
		fetchList: function(queryExecution, variable) {
			var result = queryExecution.execSelect().pipe(this.resultSetToList);
		
			return result;		
		},
		
		
		/**
		 * Fetches the first column of the first row of a result set and parses it as int.
		 * 
		 */
		fetchInt: function(queryExecution, variable) {
			var result = queryExecution.execSelect().pipe(this.resultSetToInt);
			return result;
		}
	};

})();