var AccRef = require('./acc/AccRef');

var AccUtils = {

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