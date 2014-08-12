var Class = require('../../ext/class');
var NodeConcrete = require('./concrete');

var NodeUri = Class.create(NodeConcrete, {
    classLabel: 'Node_Uri',
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
});

module.exports = NodeUri;
