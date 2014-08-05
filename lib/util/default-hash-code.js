var defaultHashCode = function(a) {
    var result;
    if(a && a.hashCode) {
        result = a.hashCode();
    }
    else {
        result = '' + a;
    }
    
    return result;
};

module.exports = defaultHashCode;