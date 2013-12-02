/*
 * With Sponate we use jQuery as the 'standard' deferred api.
 *
 * We are not going to abstract this away, we'll just provide a wrapper/bridge to angular.
 * 
 * http://xkcd.com/927/
 * 
 */

// TODO We need to intercept store creation to add the plugin,
// in other words, we need a store factory

(function() {

	var tmp = Jassa.sponate;
	
	if(!tmp.angular) {
		tmp.angular = {};
	}
	
	var ns = Jassa.sponate.angular;
	


	ns.bridgePromise = function(jqPromise, ngDeferred, ngScope, fn) {
		jqPromise.done(function(data) {
			
			var d = fn ? fn(data) : data;
			ngDeferred.resolve(d);

		    if (ngScope && ngScope.$root.$$phase != '$apply' && ngScope.$root.$$phase != '$digest') {
		        ngScope.$apply();
		    }
			
		}).fail(function(data) {
			ngDeferred.reject(data);
		});
		
		return ngDeferred.promise;
	}

})();
