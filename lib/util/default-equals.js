var isEqual = require('lodash.isequal');

var defaultEquals = function(a, b) {
    var result;
    if(a && a.equals) {
        result = a.equals(b);
    }
    else if(b && b.equals) {
        result = b.equals(a);
    }
    else {
        result = isEqual(a, b);
    }
    
    return result;
};

module.exports = defaultEquals;
