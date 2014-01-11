
var isEmpty = function(value) {
	return !isNonEmpty(value);
}

var isNotEmpty = function(value) {
	return value || value === 0;
}


var RdfGraph = function(json) {
	this.json = json;
}

NodeValue = function(jsonLiteral) {
		this.jsonLiteral = jsonLiteral;
};

NodeValue.createFromJson = function(jsonLiteral) {
	if(!jsonLiteral) {
		throw "jsonLiteral must not be null";
	}

	var result = new NodeValue(jsonLiteral);
	return result;
}

NodeValue.prototype = {
	getLang: function() {
		var result = this.jsonLiteral.lang; 
		if(!result) {
			result = "";
		}
		
		return result;
	},
		
	asString: function() {
		return "" + this.jsonLiteral.value;
	},

		
	asFloat: function() {
		var val = this.jsonLiteral.value;
		var result = parseFloat(val);
		return result;
	}
}

RdfGraph.prototype = {
		
		getStrings: function(subject, property, prefLangs) {
			var values = this.getFilteredByLang(subject, property, prefLangs);
			var result = _.map(values, function(value) {
				return value.asString();
			});
			return result;			
		},
		
		getFilteredByLang: function(subject, property, prefLangs) {
			var result = [];
			
			var values = this.getValues(subject, property);

			// Index by language
			var langToValues = {};		
			_.each(values, function(value) {
				var lang = value.getLang();
				var items = langToValues[lang];
				if(!items) {
					items = [];
					langToValues[lang] = items;
				}
				items.push(value);
			});
			
			
			// Pick the most preferred one
			var result;
			for(var i = 0; i < prefLangs.length; ++i) {
				var prefLang = prefLangs[i];
				
				var result = langToValues[prefLang];
				
				if(result) {
					break;
				}
			}
			
			if(!result) {
				result = [];
			}
			
			return result;
		},
		
		getFloats: function(subject, property) {
			
			var values = this.getValues(subject, property);
			var result = _.chain(values)
			.map(function(value) {
				return value.asFloat();
			})
			.filter(isNotEmpty)
			.value();
			
			//console.log("result", result);
			return result;
		},
		
		getValues: function(subject, property) {
			var result = [];
			//console.log("[RdfGraph::getValues@subject]", subject);
			var properties = this.json[subject];
			if(properties) {
				var objects = properties[property];
				if(objects) {
					//console.log("[RdfGraph::getValues@objects]", objects);
					for(var i = 0; i < objects.length; ++i) {
						var o = objects[i];
						
						var nv = NodeValue.createFromJson(o);
						result.push(nv);
					}
				}				
			}			
			
			return result;
		}
}