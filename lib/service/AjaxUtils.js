var defaults = require('lodash.defaults');

var AjaxUtils = {

    /**
     *
     */
    createSparqlRequestAjaxSpec: function(baseUrl, defaultGraphIris, queryString, dataDefaults, ajaxDefaults) {
        var data = {
            query: queryString,
            'default-graph-uri': defaultGraphIris,
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

        return result;
    }
};

module.exports = AjaxUtils;
