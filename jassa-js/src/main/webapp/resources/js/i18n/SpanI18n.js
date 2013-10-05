(function() {
	
	var utils = Namespace("org.aksw.ssb.utils");
	var uriUtils = Namespace("org.aksw.ssb.utils.uris");
	
	var ns = utils;

	
	/**
	 * A class that fills in approprate labels for spans, such as
	 * &gt;span data-uri="http://..." /h&lt;
	 * 
	 * @param labelFetcher
	 * @returns {ns.SpanI18n}
	 */
	ns.SpanI18n = function(labelFetcher) {
		this.labelFetcher = labelFetcher;
	};
	
	ns.SpanI18n.prototype = {
		update: function(parentEl) {
			var uriToEls = {};
			var attrName = 'data-uri';
			
			var selector = 'span[' + attrName + ']';
			
			var selfMatch = $(parentEl).filter(selector);
			var matches = $(parentEl).find(selector).add(selfMatch);

			matches.each(function(index, el) {
				//console.log("Found a span with data-uri attribute");
				
			    var uri = $(el).attr(attrName);
			    
			    var arr = uriToEls[uri];
			    if(!arr) {
			    	arr = [];
			    	uriToEls[uri] = arr;
			    }
			    arr.push(el);
			    
			});	
			
			uris = _.keys(uriToEls);
			//console.log("URIS", uriToEls);

			
			this.labelFetcher.fetch(uris).done(function(labelInfo) {
				var uris = labelInfo.uris;
				var uriToLabel = labelInfo.uriToLabel;

				//console.log("URI", uris);

				_.each(uris, function(uri) { 
					var uriStr = uri.value;
					
					var label = uriToLabel[uriStr];
					var text = null;
					if(label) {
						text = label.value;						
					}
					
					if(!text || text === "") {
						text = uriUtils.extractLabelFromUri(uriStr);
					}
					
					var els = uriToEls[uriStr];					
					_.each(els, function(el) {
						$(el).text(text);
					});
				});				
			}).fail(function(data) {
				console.log("Failed to fetch labels");
			});
		}
	};
	
})();
