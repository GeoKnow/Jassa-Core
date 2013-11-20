(function($) {

	var uriUtils = Namespace("org.aksw.ssb.utils.uris");
	var collections = Namespace("org.aksw.ssb.collections");
	var sparql = Namespace("org.aksw.ssb.sparql.syntax");
	var qt = Namespace("org.aksw.ssb.collections.QuadTree");
	var queryUtils = Namespace("org.aksw.ssb.facets.QueryUtils");
	var rdfs = Namespace("org.aksw.ssb.vocabs.rdfs");
	var utils = Namespace("org.aksw.ssb.utils");

	
	var ns = Namespace("org.aksw.ssb.utils");
	
	
	
	/**
	 * 
	 * 
	 * @param sparqlService
	 * @param langs
	 * @param fetchAllLangs The controls whether all of a resource's labels should be fetched immediately or on-demand. 
	 * @param queryCacheFactory
	 * @param prefixResolver
	 * @returns {ns.LabelFetcher}
	 */
	ns.LabelFetcher =  function(sparqlService, langs, fetchAllLangs, prefixResolver) {
		this.langs = langs ? langs : ['en', ''];
		this.fetchAllLangs = fetchAllLangs ? fetchAllLangs : true;
		this.sparqlService = sparqlService;
		
		//this.cache = cache ? cache : ns.LabelFetcher.defaultCache;
		
		this.prefixResolver = prefixResolver;
		
		var query = this.createQueryLabels();
		
		this.queryCacheFactory = new utils.QueryCacheFactory(sparqlService);
		this.queryCache = this.queryCacheFactory.create(query);
	};
	


	ns.LabelFetcher.prototype = {
			createQueryLabels: function() {

				var query = new sparql.Query();
				var u = sparql.Node.v("u");
				var l = sparql.Node.v("l");
				
				query.projectVars.add(u);
				query.projectVars.add(l);
				
				query.elements.push(new sparql.ElementTriplesBlock([new rdf.Triple(u, rdfs.label, l)]));
		
				
				var filter = null;	
				if(!this.fetchAllLangs) {
				
					var ors = [];
					for(var i in this.langs) {
						var lang = this.langs[i];
						
						var expr = new sparql.E_LangMatches(new sparql.E_Lang(new sparql.ExprVar(l)), new sparql.NodeValue(sparql.Node.plainLiteral(lang)));
						
						ors.push(expr);
					}
					
					if(ors.length != 0) {
						var orExpr = sparql.orify(ors);
						filter = new sparql.ElementFilter([orExpr]);
						
						query.elements.push(filter);
					}
				}
			
				return query;
			},
			

			// TODO uris = String[]. Maybe this should be sparql.Node[]
			fetch: function(uriStrs) {

				validUriStrs = uriUtils.filterUrisValidate(uriStrs);
				
				var uris = _.map(validUriStrs, function(uriStr) {
					return sparql.Node.uri(uriStr);
				});
					
				//var self = this;
				//alert(queryString);
				var u = sparql.Node.v("u");
				var deferred = this.queryCache.lookup(u, uris).pipe(function(rs) {
					
					var uriToLabel = {};
					
					//console.log("Cache result: ", rs);
					
					// Add the results to the cache
					for(var i = 0; i < rs.results.bindings.length; ++i) {
						var binding = rs.results.bindings[i];
						
						//console.log("Binding: ", binding);
						
						var uri = binding.u.value;
						var labelNode = binding.l;
						var label = labelNode.value;
						
						// TODO possible BUG Shouldn't xml:lang be lang for valid Talis Json?
						var lang = labelNode["xml:lang"];
						if(!lang) {
							lang = "";
						}
						
						//console.debug("Got label", uri, lang, labelNode.value);
						
						uriToLabel[uri] = {value: label, lang: lang};
					}				
					
					result = {uris: uris, uriToLabel: uriToLabel};
					
					return result;
				});	

				
				// TODO Use the prefix resolver on all URIs that still have no label
				//if(!)
				
				
				
				return deferred.promise();
			}
			
	};

	

	
	
		/*
		var self = this;
		var queryString = "Prefix rdfs:<http://www.w3.org/2000/01/rdf-schema#> Select ?u ?l { ?u rdfs:label ?l . " + filterStr + "Filter(?u In (<" + lookups.join(">,<") + ">)) . }";
		this.queryCache = queryCacheFactory.create();
		*/
	
	
	
	
	/**
	 * 
	 * @param sparqlService
	 * @param langs
	 * @param fetchAllLangs
	 * @param cache
	 * @param prefixResolver An object that can obtain prefixes for uris. Only used as a fallback if no other label could be obtained for a uri.
	 * @returns {ns.LabelFetcher}
	 */
	ns.LabelFetcherOld = function(sparqlService, langs, fetchAllLangs, cache, prefixResolver) {
		this.langs = langs ? langs : ['en', ''];
		this.fetchAllLangs = fetchAllLangs ? fetchAllLangs : true;
		this.sparqlService = sparqlService;
		
		this.cache = cache ? cache : ns.LabelFetcher.defaultCache;
		
		
		this.prefixResolver = prefixResolver;
	};
	
	// A cache instance that is shared among label fetcher instances
	// NOTE Data based on different LabelFetcher
	// configurations will go into the same cache.
	ns.LabelFetcher.defaultCache = new collections.LabelCollection();

	
	/**
	 * 
	 * 
	 * @param uris An array of uri-strings
	 * @param includeAllUris
	 */
	ns.LabelFetcherOld.prototype.cacheLookup = function(uris, includeAllUris) {
		var entries = {};
		var lookups = [];
		
		for(var i in uris) {
			var uri = uris[i];
			
			if(uri in this.cache.uriToLangToLabel) {
				
				var langToLabel = this.cache.uriToLangToLabel[uri];
				
				var label = null;
				for(var j in this.langs) {
					var lang = this.langs[j];
					
					if(lang in langToLabel) {				
						label = langToLabel[lang];
						
						entries[uri] = {value: label, lang: lang};
						break;
					}
				}
				
				if(!this.fetchAllLangs && label == null) {
					lookups.push(label);
				}
	
			} else {
				lookups.push(uri);
			}
		}
		
		return {entries: entries, notFound: lookups};
	};
	
	// TODO uris = String[]. Maybe this should be sparql.Node[]
	ns.LabelFetcherOld.prototype.fetch = function(uris, includeAllUris) {
	
		//var uriStrs = _.map(uris, function(uri) { return uri.value; });
		
		var lookupResult = this.cacheLookup(uris, includeAllUris);
		var result = lookupResult.entries;	
		var lookups = lookupResult.notFound;
	
		lookups = uriUtils.filterUrisValidate(lookups);
	
		if(lookups.length === 0) {
//			if(callback) {				
//				callback(result);
//			}
			defer = $.Deferred();
			defer.resolve({uris: uris, uriToLabel: result});
			//defer.promise();
			return defer.promise();
		}
		
		//console.debug("Fetching labels for (<" + uris.join('> , <') + ">)");
	
		var filterStr = "";	
		if(!this.fetchAllLangs) {
		
			var ors = [];
			for(var i in this.langs) {
				var lang = this.langs[i];
				
				ors.push("langMatches(lang(?l), '" + lang + "')");
			}
			
			if(ors.length != 0) {
				filterStr = "Filter(" + ors.join(" || ") + ") . ";
			}
		}
		
		
		var self = this;
		
		
		var query = sparql.Query();
		var u = sparql.Node.v("u");
		var l = sparql.Node.v("l");
		query.elements.push(new sparql.ElementTriplesBlock(new rdf.Triple(u, rdfs.label, l)));
		
		var queryString = "Prefix rdfs:<http://www.w3.org/2000/01/rdf-schema#> Select ?u ?l { ?u rdfs:label ?l . " + filterStr + "Filter(?u In (<" + lookups.join(">,<") + ">)) . }";
	
		//var self = this;
		//alert(queryString);
		var deferred = this.sparqlService.executeSelect(queryString).pipe(function(rs) {	
			// Add the results to the cache
			for(var i in rs.results.bindings) {
				var binding = rs.results.bindings[i];
				
				var uri = binding.u.value;
				var labelNode = binding.l;
				
				// TODO possible BUG Shouldn't xml:lang be lang for valid Talis Json?
				var lang = labelNode["xml:lang"];
				if(!lang) {
					lang = "";
				}
				
				//console.debug("Got label", uri, lang, labelNode.value);
				
				self.cache.put(uri, lang, labelNode.value);
			}
			
			var lr = self.cacheLookup(lookups, includeAllUris);
			var map = lr.entries;
			//console.log("LabelCache", self.cache);
			//mergeMapsInPlace(result, map);
			_.extend(result, map);
			
			
			return {uris: uris, uriToLabel: result};
		});	

		
		// TODO Use the prefix resolver on all URIs that still have no label
		//if(!)
		
		
		
		return deferred.promise();
	};
	
	
	
	
	/**
	 * @Deprecated
	 * A static function that fetches labels of the given set of uris.
	 * 
	 */
	/*
	ns.fetchLabels = function(uris, languages, callback) {		
		uris = filterUrisValidate(uris);
		
		if(uris.length == 0) {
			return;
		}
		
		console.log("Fetching labels for (<" + uris.join('> , <') + ">)");

		
		var queryString = "Select ?u ?l { ?u rdfs:label ?l . Filter(langMatches(lang(?l), '" + language + "')) . Filter(?u In (<" + uris.join(">,<") + ">)) . }";

		//var self = this;
		//alert(queryString);
		this.sparqlService.executeSelect(queryString, {
			failure: function() { notify("Error", "Sparql Query Failed"); },
			success: function(response) {
				
				var map = jsonRdfResultSetToMap($.parseJSON(response), "u", "l");

				callback(map);				
			}	
		});	
	}*/

	ns.getLabel = function(uri, labelInfo) {
		var label = labelInfo.uriToLabel[uri.value];
		
		var result = label ? label.value : "" + uri;
		
		return result;
	};

	
})(jQuery);
