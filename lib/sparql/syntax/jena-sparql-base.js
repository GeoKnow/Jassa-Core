(function() {

	var ns = Jassa.sparql;

	/*
	 * rdf.Node is the same as sparql.Node, but the former is strongly preferred. 
	 * This alias for the Node object between the rdf and sparql namespace exists for legacy reasons.
	 */
	ns.Node = Jassa.rdf.Node;

	
	
	
	
    ns.PrefixMappingImpl = Class.create({
        initialize: function(prefixes) {
            this.prefixes = prefixes ? prefixes : {};
        },
        
        expandPrefix: function(prefixed) {
            throw 'Not implemented yet - sorry';
        },
        
        getNsPrefixMap: function() {
            return this.prefixes;
        },
        
        getNsPrefixURI: function(prefix) {
            return this.prefixes[prefix];
        },
        
        /**
         * Answer the prefix for the given URI, or null if there isn't one.
         */
        getNsURIPrefix: function(uri) {
            var result = null;
            var bestNs = null;
            
            _(this.prefixes).each(function(u, prefix) {
                if(_(uri).startsWith(u)) {
                    if(!bestNs || (u.length > bestNs.length)) {
                        result = prefix;
                        bestNs = u;
                    }
                }
            });
   
           return result;
        },

        qnameFor: function(uri) {
            
        },
        
        removeNsPrefix: function(prefix) {
            delete this.prefixes[prefix];
        },
        
        samePrefixMappingAs: function(other) {
            throw 'Not implemented yet - Sorry';
        },
        
        setNsPrefix: function(prefix, uri) {
            this.prefixes[prefix] = uri;
            
            return this;
        },
        
        setNsPrefixes: function(obj) {
            var json = _(obj.getNsPrefixMap).isFunction() ? obj.getNsPrefixMap() : obj;

            var self = this;
            _(json).each(function(uri, prefix) {
                self.setNsPrefix(prefix, uri);
            });
            
            return this;
        },

        shortForm: function(uri) {
            var prefix = this.getNsPrefixURI(uri);
            
            var result;
            if(prefix) {

                var u = this.prefixes[uri];
                var qname = uri.substring(u.length);
                
                result = prefix + ':' + qname;
            } else {
                result = uri;
            }
            
            return result;
        },
        
        addPrefix: function(prefix, urlBase) {
            this.prefixes[prefix] = urlBase;
        },
        
        getPrefix: function(prefix) {
            var result = this.prefixes[prefix];
            return result;
        },
        
        addJson: function(json) {
            _.extend(this.prefixes, json);
        },
        
        getJson: function() {
            return this.prefixes;
        }
    });

})();