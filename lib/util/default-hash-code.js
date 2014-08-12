var defaultHashCode = function(a) {
    var result;
    if (a && a.hashCode) {
        result = a.hashCode();
    } else {
        result = a.toString();
    }

    return result;
};

module.exports = defaultHashCode;
