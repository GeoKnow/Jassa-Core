var AccRef = require('./acc/AccRef');
var AccTransform = require('./acc/AccTransform');

var AccUtils = {


    unwrapAccTransform: function(acc) {
        var result = acc;
        while(result instanceof AccTransform) {
            result = result.getSubAcc();
        }

        return result;
    },


    /**
     *
     * @param acc An accumulator or an array of accumulators
     * @param result
     * @returns {Array}
     */
    getRefs: function(acc, result) {
        //console.log('Acc: ', acc);
        result = result || [];

        if(Array.isArray(acc)) {
            acc.forEach(function(item) {
                AccUtils.getRefs(item, result);
            });
        } else if(acc instanceof AccRef) {
            result.push(acc);
        } else {
            var subAccs = acc.getSubAccs();
            AccUtils.getRefs(subAccs, result);
        }

        return result;
    },

};

module.exports = AccUtils;