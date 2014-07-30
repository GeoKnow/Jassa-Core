(function() {

    //var util = Jassa.util;
    var rdf = Jassa.rdf;
    var sparql = Jassa.sparql;
    var service = Jassa.service;
    
    var ns = Jassa.sponate;
    
    ns.LookupServiceUtils = {
        createLookupServiceNodeLabels: function(sparqlService, prefLangs, prefLabelPropertyUris) {
            var store = new ns.StoreFacade(sparqlService);
            
            var labelMap = ns.SponateUtils.createDefaultLabelMap(prefLangs, prefLabelPropertyUris);
            store.addMap(labelMap, 'labels');
            var labelsStore = store.labels;    

            var lookupServiceNodeLabels = new service.LookupServiceSponate(labelsStore);                
            lookupServiceNodeLabels = new service.LookupServiceChunker(lookupServiceNodeLabels, 20);
            lookupServiceNodeLabels = new service.LookupServiceIdFilter(lookupServiceNodeLabels, function(node) {
                // TODO Using a proper URI validator would increase quality
                var r = node && node.isUri();
                if(r) {
                    var uri = node.getUri();
                    r = r && !_(uri).include(' ');
                    r = r && !_(uri).include('<');
                    r = r && !_(uri).include('>');
                }
                return r;
            });             
            lookupServiceNodeLabels = new service.LookupServiceTimeout(lookupServiceNodeLabels, 20);
            lookupServiceNodeLabels = new service.LookupServiceTransform(lookupServiceNodeLabels, function(doc, id) {
                var result = doc ? doc.displayLabel : null;
                
                if(!result) {
                    if(!id) {
                        result = null; //'(null id)';
                    }
                    else if(id.isUri()) {
                        result = ns.extractLabelFromUri(id.getUri());
                    }
                    else if(id.isLiteral()) {
                        result = '' + id.getLiteralValue();
                    }
                    else {
                        result = '' + id;
                    }
                }                
                
                return result; 
            });
            
            var lookupServiceNodeLabels = new service.LookupServiceCache(lookupServiceNodeLabels);
            return lookupServiceNodeLabels;
        }        
    };
    
})();
