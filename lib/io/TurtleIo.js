var _ = require('lodash');

var TurtleIo = {

    serializePrefixMapping: function(prefixMapping) {
        var result = this.serializePrefixObj(prefixMapping.getJson());
        return result;
    },

    serializePrefixObj: function(obj) {
        var result = _.map(obj, function(uri, prefix) {
            var r = '@prefix ' + prefix + ': <' + uri + '>' + ' .';
            return r;
        }).join('\n');

        return result;
    }
};

module.exports = TurtleIo;
