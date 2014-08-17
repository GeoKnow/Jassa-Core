var defaults = require('lodash.defaults');

var AjaxUtils = {

    /**
     *
     */
    createSparqlRequestAjaxSpec: function(baseUrl, defaultGraphIris, queryString, dataDefaults, ajaxDefaults) {
        // ISSUE #13 - Added HACK to make it work for at least one defaultGraph...
        var hack = defaultGraphIris;
        if(hack && hack.length === 1) {
            hack = hack[0];
        }

        var data = {
            query: queryString,
            'default-graph-uri': hack 
        };

        var result = {
            url: baseUrl,
            dataType: 'json',
            crossDomain: true,
            traditional: true,
            data: data,
        };

        defaults(data, dataDefaults);
        defaults(result, ajaxDefaults);

        //console.log('Created ajax spec: ' + JSON.stringify(result));
        return result;
    }
};

module.exports = AjaxUtils;
