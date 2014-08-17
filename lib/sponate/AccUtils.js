var AccRef = require('./acc/AccRef');

var AccUtils = {
    collectRefs: function(acc, result) {
        var self;
        
        if(acc instanceof AccRef) {
            result.push(acc);
        } else {
            var subAccs = acc.getSubAccs();
            subAccs.forEach(function(subAcc) {
                self.collectRefs(subAcc, result);
            });
        }
    },
    
    getRefs: function(acc) {
        var result = [];
        this.collectRefs(acc, result);
        return result;
    },

};

module.exports = AccUtils;