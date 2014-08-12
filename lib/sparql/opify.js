/**
 * Deprecated
 *
 * This object is overridden by opifyBalanced
 *
 */
var opify = function(exprs, fnCtor) {
    var open = exprs;
    var next = [];

    while (open.length > 1) {

        for (var i = 0; i < open.length; i += 2) {

            var a = open[i];

            if (i + 1 === open.length) {
                next.push(a);
                break;
            }

            var b = open[i + 1];

            var newExpr = fnCtor(a, b);

            next.push(newExpr); // ;new ns.E_LogicalOr(a, b));
        }

        open = next;
        next = [];
    }

    return open;
};

module.exports = opify;
