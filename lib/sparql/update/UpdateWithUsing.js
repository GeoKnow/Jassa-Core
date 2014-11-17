var Class = require('../../ext/Class');

var UpdateWithUsing = Class.create({
    initialize: function(withUriStr) {
        this.withUriStr = withUriStr;
    },

    toString: function() {
        var result = '';

        if(this.withClause) {
            result += 'WITH ' + this.withUriStr + ' ';
        }

        return result;
    }
});

module.exports = UpdateWithUsing;
