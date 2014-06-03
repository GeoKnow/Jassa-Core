"use strict";

/**
 * Defines the global variable into which the modules
 * will add their content
 * 
 * A note on naming convention:
 * The root objectand classes is spelled with upper camel case.
 * modules, functions and objects are in lower camel case.
 * (modules are just namespaces, and it feels pretty obstrusive writing them in upper camel case)
 * 
 */
var jassa = {
	vocab: {
		util: {},
		xsd: {},
		rdf: {},
		rdfs: {},
		owl: {},
		wgs84: {}
	},

	rdf: {
	},
		
	sparql: {},

	service: {},
	
	i18n: {},

	sponate: {},
	
	facete: {},
	
	util: {
		//collection: {}
	},
	
	client: {},
	
	geo: {
	    openlayers: {},
	    leaflet: {}
	}
};

// Upper case version for legacy code 
var Jassa = jassa;

// Export for nodejs
var module;

if(!module) {
    module = {};
}

module["exports"] = jassa;


