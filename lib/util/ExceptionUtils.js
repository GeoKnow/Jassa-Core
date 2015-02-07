
var ExceptionUtils = {
    /**
     * Try to evaluate a function, thereby silently catching exceptions and returning a fallback value instead
     *
     * @param fn
     * @param fallback
     * @returns
     */
    tryEval: function(fn, fallback) {
        var result;
        try {
            result = fn();
        } catch(e) {
            result = fallback;
        }

        return result;
    }
};

module.exports = ExceptionUtils;
