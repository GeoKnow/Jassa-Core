var HashSet = require('./collection/HashSet');

var SetUtils = {
    arrayToSet: function(arr) {
        var result = new HashSet();
        result.addAll(arr);

        return result;
    }

};

module.exports = SetUtils;
