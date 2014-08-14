
var PatternUtils = {
    /**
     * Get all patterns in a pattern
     */
    getRefs: function(pattern) {
        var result = [];

        var fn = function(pattern) {
            var proceed = true;
            if (pattern instanceof ns.PatternRef) {
                result.push(pattern);
                proceed = false;
            }

            return proceed;
        };

        util.TreeUtils.visitDepthFirst(pattern, this.getChildren, fn);

        return result;
    },

    getChildren: function(pattern) {
        return pattern.getSubPatterns();
    },

    /**
     * Generic method for visiting a tree structure
     *
     */
//      visitDepthFirst: function(parent, fnChildren, fnPredicate) {
//          var proceed = fnPredicate(parent);
//
//          if(proceed) {
//              var children = fnChildren(parent);
//
//              _(children).each(function(child) {
//                  ns.PatternUtils.visitDepthFirst(child, fnChildren, fnPredicate);
//              });
//          }
//      }

};

module.exports = PatternUtils;
