var defaults = require('lodash.defaults');

var unwrapSingleItem = function(arr) {
    var result = arr ? (arr.length > 1 ? arr : (arr[0] || null)) : null;
    return result;
};

var AjaxUtils = {

    createSparqlUpdateAjaxSpec: function(queryString, baseUrl, usingGraphUris, usingNamedGraphUris, dataDefaults, ajaxDefaults) {
        var data = {
            update: queryString,
            'using-graph-uri': unwrapSingleItem(usingGraphUris),
            'using-named-graph-uri': unwrapSingleItem(usingNamedGraphUris)
        };

        var result = {
            url: baseUrl,
            type: 'POST',
            dataType: 'json',
            crossDomain: true,
            traditional: true,
            data: data
        };

        defaults(data, dataDefaults);
        defaults(result, ajaxDefaults);

        return result;
    },

    createSparqlRequestAjaxSpec: function(baseUrl, defaultGraphIris, queryString, dataDefaults, ajaxDefaults) {
        // ISSUE #13 - Added HACK to make it work for at least one defaultGraph...
        var hack = unwrapSingleItem(defaultGraphIris);

        var data = {
            query: queryString,
            'default-graph-uri': hack
        };

        var result = {
            url: baseUrl,
            dataType: 'json',
            crossDomain: true,
            traditional: true,
            data: data
        };

        defaults(data, dataDefaults);
        defaults(result, ajaxDefaults);

        //console.log('Created ajax spec: ' + JSON.stringify(result));
        return result;
    }
};

module.exports = AjaxUtils;
