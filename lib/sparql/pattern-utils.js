var union = require('lodash.union');

var isFunction = function(obj) {
    return typeof obj === 'function';
};

var PatternUtils = {
    getVarsMentioned: function(elements) {

        var result = elements.reduce(function(memo, element) {

            var fn = element.getVarsMentioned;
            if (!fn || !isFunction(fn)) {
                console.log('[ERROR] .getVarsMentioned not found on object ', element);
            }

            var vs = element.getVarsMentioned();
            var r = union(memo, vs);
            return r;
        }, []);

        return result;
    },
};

module.exports = PatternUtils;
