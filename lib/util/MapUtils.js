var HashMap = require('./collection/HashMap');
var ObjectUtils = require('./ObjectUtils');

var MapUtils = {
    indexBy: function(arr, keyOrFn, result) {
        result = result || new HashMap();

        var fnKey;

        if (ObjectUtils.isString(keyOrFn)) {
            fnKey = function(obj) {
                return obj[keyOrFn];
            };
        } else {
            fnKey = keyOrFn;
        }

        arr.forEach(function(item) {
            var key = fnKey(item);
            result.put(key, item);
        });

        return result;
    },
};

module.exports = MapUtils;
