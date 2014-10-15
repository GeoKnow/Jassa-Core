var JSONCanonical = require('../ext/JSONCanonical');

var isObject = function(obj) {
    var type = typeof obj;
    return type === 'function' || type === 'object' && Boolean(obj);
};

var JsonUtils = {
    stringifyCyclic: function(obj, fn) {
        var seen = [];
        var result = JSONCanonical.stringify(obj, function(key, val) {
            if (isObject(val)) {
                if (seen.indexOf(val) >= 0) {
                    return;
                }

                seen.push(val);

                if (fn) {
                    val = fn(key, val);
                }
            }
            return val;
        });

        return result;
    }
};

module.exports = JsonUtils;
