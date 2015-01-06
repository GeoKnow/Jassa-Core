var _ = require('lodash');

var SparqlIo = {

    serializePrefixMapping: function(prefixMapping) {
        var result = this.serializePrefixObj(prefixMapping.getJson());
        return result;
    },

    serializePrefixObj: function(obj) {
        var result = _.map(obj, function(uri, prefix) {
            var r = 'Prefix ' + prefix + ': <' + uri + '>';
            return r;
        }).join('\n');

        return result;
    }
};

module.exports = SparqlIo;
