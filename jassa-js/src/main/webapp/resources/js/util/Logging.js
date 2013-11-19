(function() {

	if (typeof console === 'undefined') {
		console = {};
	}
	
	if(!console.log) {
		console.log = function() { }
	}
	
	if(!console.debug) {
		
		
		console.log('[DEBUG] ')
	}
	
		window.console = {
			debug : function() {
				console.log.apply(arguments);
			},
			trace : function() {
			},
			log : function() {
			},
			info : function() {
			},
			warn : function() {
			},
			error : function() {
			}
		};
	}

});
