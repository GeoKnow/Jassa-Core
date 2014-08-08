var E_LogicalAnd = require('./e/e-logical-and');
var opify = require('./opify');

var andify = function(exprs) {
    var result = opify(exprs, E_LogicalAnd);
    return result;
};

module.exports = andify;
