var ELogicalAnd = require('./e/e-logical-and');
var opify = require('./opify');

var andify = function(exprs) {
    var result = opify(exprs, ELogicalAnd);
    return result;
};

module.exports = andify;
