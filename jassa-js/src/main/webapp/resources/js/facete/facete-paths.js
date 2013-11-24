(function() {

	var ns = Jassa.facete;
	

	/**
	 * 
	 * @param direction
	 * @param resource
	 * @returns {ns.Step}
	 */
	ns.Step = Class.create({
		
		initialize: function(propertyName, isInverse) {
			this.type = "property";
			this.propertyName = propertyName;
			this._isInverse = isInverse;
		},
	
		toJson: function() {
			var result = {
				isInverse: this.isInverse,
				propertyName: this.propertyName
			};
			
			return result;
		},
		
		getPropertyName: function() {
			return this.propertyName;
		},

		isInverse: function() {
			return this._isInverse;
		},


		equals: function(other) {
			return _.isEqual(this, other);
		},

		toString: function() {
			if(this._isInverse) {
				return "<" + this.propertyName;
			} else {
				return this.propertyName;
			}
		},
		
		createElement: function(sourceVar, targetVar, generator) {
			var propertyNode = sparql.Node.uri(this.propertyName);
			
			var triple;
			if(this._isInverse) {
				triple = new rdf.Triple(targetVar, propertyNode, sourceVar);
			} else {
				triple = new rdf.Triple(sourceVar, propertyNode, targetVar);
			}
			
			var result = new sparql.ElementTriplesBlock([triple]);
			
			return result;
		}
	});
	
	ns.Step.classLabel = 'Step';

	
	/**
	 * Create a Step from a json specification:
	 * {
	 *     propertyName: ... ,
	 *     isInverse: 
	 * }
	 * 
	 * @param json
	 */
	ns.Step.fromJson = function(json) {
		var propertyName = checkNotNull(json.propertyName);
		var isInverse = json.IsInverse();
		
		var result = new ns.Step(propertyName, isInverse);
		return result;
	};
	
	ns.Step.parse = function(str) {
		var result;
		if(_(str).startsWith("<")) {
			result = new ns.Step(str.substring(1), true);
		} else {
			result = new ns.Step(str, false);
		}
		return result;
	},

	
	/**
	 * A path is a sequence of steps
	 * 
	 * @param steps
	 * @returns {ns.Path}
	 */
	ns.Path = Class.create({
		initialize: function(steps) {
			this.steps = steps ? steps : [];
		},
		
		isEmpty: function() {
			var result = this.steps.length === 0;
			return result;
		},
		
		toString: function() {
			var result = this.steps.join(" ");
			return result;
		},	
	
		concat: function(other) {
			var result = new ns.Path(this.steps.concat(other.steps));
			return result;
		},
	
		getLastStep: function() {
			var steps = this.steps;
			var n = steps.length;
			
			var result;
			if(n === 0) {
				result = null;
			} else {
				result = steps[n - 1];
			}
			
			return result;
		},
		
		getSteps: function() {
			return this.steps;
		},
	
		startsWith: function(other) {
			var n = other.steps.length;
			if(n > this.steps.length) {
				return false;
			}
			
			for(var i = 0; i < n; ++i) {
				var thisStep = this.steps[i];
				var otherStep = other.steps[i];
				
				//console.log("      ", thisStep, otherStep);
				if(!thisStep.equals(otherStep)) {
					return false;
				}
			}
			
			return true;			
		},
		
		hashCode: function() {
			return this.toString();
		},
		
		// a equals b = a startsWidth b && a.len = b.len
		equals: function(other) {
			var n = this.steps.length;
			if(n != other.steps.length) {
				return false;
			}
			
			var result = this.startsWith(other);
			return result;
		},
	
	
		// Create a new path with a step appended
		// TODO Maybe replace with clone().append() - no, because then the path would not be immutable anymore
		copyAppendStep: function(step) {
			var newSteps = this.steps.slice(0);
			newSteps.push(step);
			
			var result = new ns.Path(newSteps);
			
			return result;
		},
		
		toJson: function() {
			var result = [];
			var steps = this.steps;
			
			for(var i = 0; i < steps.length; ++i) {
				var step = steps[i];
				
				var stepJson = step.toJson(); 
				result.push(stepJson);
			}
			
			return result;
		},
		
		/*
		 * 
		 * TODO Make result distinct
		 */
		getPropertyNames: function() {
			var result = [];
			var steps = this.steps;
			
			for(var i = 0; i < steps.length; ++i) {
				var step = steps[i];
				var propertyName = step.getPropertyName();
				result.push(propertyName);
			}
			
			return result;
		}
	});

	ns.Path.classLabel = 'Path';
	
	/**
	 * Input must be a json array of json for the steps.
	 * 
	 */
	ns.Path.fromJson = function(json) {
		var steps = [];
		
		for(var i = 0; i < json.length; ++i) {
			var item = json[i];
			
			var step = ns.Step.fromJson(item);
			
			steps.push(step);
		}
		
		var result = new ns.Path(steps);
		return result;
	};

	
	ns.Path.parse = function(pathStr) {
		pathStr = _(pathStr).trim();
		
		var items = pathStr.length !== 0 ? pathStr.split(" ") : [];		
		var steps = _.map(items, function(item) {
			
			if(item === "<^") {
				return new ns.StepFacet(-1);
			} else if(item === "^" || item === ">^") {
				return new ns.StepFacet(1);
			} else {
				return ns.Step.parse(item);
			}
		});
		
		//console.log("Steps for pathStr " + pathStr + " is ", steps);
		
		var result = new ns.Path(steps);
		
		return result;
	};
	

	// @Deprecated - Do not use anymore
	ns.Path.fromString = ns.Path.parse;
	
})();
