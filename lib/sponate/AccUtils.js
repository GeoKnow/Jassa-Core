var AccRef = require('./acc/AccRef');

var AccUtils = {
    getRefs: function(acc, result) {
        result = result || [];

        var self;
        
        if(acc instanceof AccRef) {
            result.push(acc);
        } else {
            var subAccs = acc.getSubAccs();
            subAccs.forEach(function(subAcc) {
                self.collectRefs(subAcc, result);
            });
        }
        
        return result;
    },

};

module.exports = AccUtils;