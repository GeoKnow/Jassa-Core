var newBinaryExpr = function(Ctor, args) {
    if (args.length !== 2) {
        throw 'Invalid argument';
    }

    var newLeft = args[0];
    var newRight = args[1];

    var result = new Ctor(newLeft, newRight);
    return result;
};

module.exports = newBinaryExpr;
