(function() {

	var ns = Jassa.facets;

	ns.ConceptFactory = Class.create({
		createConcept: function() {
			throw "not overridden";
		}
	});


	ns.ConceptFactoryConst = Class.create(ns.ConceptFactory, {
		initialize: function(concept) {
			this.concept = concept;
		},
		
		getConcept: function() {
			return this.concept;
		},
		
		setConcept: function(concept) {
			this.concept = concept;
		},
		
		createConcept: function() {
			return concept;
		}
	});

})();