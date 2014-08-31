var AggRef = require('./agg/AggRef');

var AggUtils = {
    getRefs: function(agg, result) {
        result = result || [];

        if(agg instanceof AggRef) {
            result.push(agg);
        } else {
            var subAggs = agg.getSubAggs();
            subAggs.forEach(function(subAgg) {
                AggUtils.getRefs(subAgg, result);
            });
        }

        return result;
    },

};

module.exports = AggUtils;