var Class = require('../../ext/Class');
var Node_Concrete = require('./Node_Concrete');

var ObjectUtils = require('../../util/ObjectUtils');

var Node_Uri = Class.create(Node_Concrete, {
    classLabel: 'jassa.rdf.Node_Uri',
    initialize: function(uri) {
        this.uri = uri;
    },
    isUri: function() {
        return true;
    },
    getUri: function() {
        return this.uri;
    },
    toString: function() {
        return '<' + this.uri + '>';
    },

    hashCode: function() {
        if(this.hash == null) {
            this.hash = ObjectUtils.hashCodeStr(this.uri);
        }

        return this.hash;
    },
    equals: function(that) {
        var result =
            that != null &&
            that.isUri != null &&
            that.isUri() &&
            this.uri === that.uri;

        return result;
    }
});

module.exports = Node_Uri;
