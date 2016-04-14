var shared = require('./shared');
var forEach = require('lodash.foreach');

//var ajax = shared.ajax;
//var Promise = shared.Promise;

var AjaxUtils = {
    /**
     * In place transform.
     * Creates a beforeSend jquery ajax callback, that sets headers
     * based on a headers attribute of the ajaxSpec
     *
     */
    transformHttpRequestHeadersAngularToJquery: function(ajaxSpec) {
        if(ajaxSpec && ajaxSpec.headers) {
            var delegate = ajaxSpec.beforeSend;
            ajaxSpec.beforeSend = function(xhr) {

                forEach(ajaxSpec.headers, function(v, k) {
                    xhr.setRequestHeader(k, v);
                });

                // Call any prior beforeSend method
                if(delegate) {
                    delegate(xhr);
                }
            };
        }
    },


    createAjaxWrapperFn: function(ajaxFn) {
        var result = function() {
            var Promise = shared.Promise;

            var ajaxSpec = arguments[0];
            AjaxUtils.transformHttpRequestHeadersAngularToJquery(ajaxSpec);

            var jqXHR = ajaxFn.apply(this, arguments);

            var r = Promise.resolve(jqXHR)
                .cancellable()
                ['catch'](Promise.TimeoutError, Promise.CancellationError, function(e) {
                    //console.log('CANCELLED REQUEST');
                    jqXHR.abort();
                    throw e;
                });
            return r;
        };

        return result;
    }
};

module.exports = AjaxUtils;

