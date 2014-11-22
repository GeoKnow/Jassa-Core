var Class = require('../../ext/Class');

var UpdateWithUsing = Class.create({
    initialize: function(withNode, usingNodes, usingNamedNodes) {
        this.withNode = withNode;
        this.usingNodes = usingNodes;
        this.usingNamedNodes = usingNamedNodes;
    },

    toString: function() {
        var result = '';

        if(this.withNode != null) {
            result += 'WITH ' + this.withNode + ' ';
        }

        if(this.usingNodes != null) {
            result += 'USING ' + usingNodes.join(' ') + ' ';
        }

        if(this.usingNamedNodes != null) {
            result += 'USING NAMED' + usingNamedNodes.join(' ') + ' ';
        }

        return result;
    }
});

module.exports = UpdateWithUsing;
