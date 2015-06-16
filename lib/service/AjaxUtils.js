var defaults = require('lodash.defaults');


var AjaxUtils = {
    unwrapSingleItem: function(arr) {
        var result = arr ? (arr.length > 1 ? arr : (arr[0] || null)) : null;
        return result;
    },

    createSparqlUpdateAjaxSpec: function(queryString, baseUrl, usingGraphUris, usingNamedGraphUris, dataDefaults, ajaxDefaults) {
        // TODO Get rid of the HACK with unwrapping
        var data = {
            update: queryString,
            'using-graph-uri': AjaxUtils.unwrapSingleItem(usingGraphUris),
            'using-named-graph-uri': AjaxUtils.unwrapSingleItem(usingNamedGraphUris)
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

    //defaultGraphIris,
    createSparqlRequestAjaxSpec: function(baseUrl, datasetDescription, queryString, dataDefaults, ajaxDefaults) {
        // ISSUE #13 - Added HACK to make it work for at least one defaultGraph...
        var dgus = AjaxUtils.unwrapSingleItem(datasetDescription.getDefaultGraphUris());
        var ngus = AjaxUtils.unwrapSingleItem(datasetDescription.getNamedGraphUris());

        var data = {
            query: queryString,
            'default-graph-uri': dgus,
            'named-graph-uri': ngus
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
