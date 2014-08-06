var newUnaryExpr = function(Ctor, args) {
    if(args.length !== 1) {
        throw "Invalid argument";
    }

    var newExpr = args[0];
    
    var result = new Ctor(newExpr);
    return result;      
};

module.exports = newUnaryExpr;

