var AccRef = require('./acc/AccRef');

var AccUtils = {
    getRefs: function(acc, result) {
        //console.log('Acc: ', acc);
        result = result || [];

        if(acc instanceof AccRef) {
            result.push(acc);
        } else {
            var subAccs = acc.getSubAccs();
            subAccs.forEach(function(subAcc) {
                AccUtils.getRefs(subAcc, result);
            });
        }

        return result;
    },

};

module.exports = AccUtils;