var MultiMapUtils = {
    get: function(obj, key) {
        return (key in obj) ? obj[key] : [];
    },

    put: function(obj, key, val) {
        var values;

        if (key in obj) {
            values = obj[key];
        } else {
            values = [];
            obj[key] = values;
        }

        values.push(val);
    },

    clear: function(obj) {
        var keys = Object.keys(obj);
        keys.forEach(function(key) {
            delete obj[key];
        });
    }
};

module.exports = MultiMapUtils;
