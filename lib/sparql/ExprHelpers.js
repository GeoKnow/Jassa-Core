var ExprHelpers = {

    newBinaryExpr: function(Ctor, args) {
        if (args.length !== 2) {
            throw new Error('Invalid argument');
        }

        var newLeft = args[0];
        var newRight = args[1];

        var result = new Ctor(newLeft, newRight);
        return result;
    },

    newUnaryExpr: function(Ctor, args) {
        if (args.length !== 1) {
            throw new Error('Invalid argument');
        }

        var newExpr = args[0];

        var result = new Ctor(newExpr);
        return result;
    },

    joinElements: function(separator, elements) {
        var strs = elements.map(function(element) {
            return element.toString();
        });
        var filtered = strs.filter(function(str) {
            return str.length !== 0;
        });

        return filtered.join(separator);
    },

};

module.exports = ExprHelpers;
