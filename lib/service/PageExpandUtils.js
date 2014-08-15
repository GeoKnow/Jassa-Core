    /**
     * Returns an object:
     * {
     *    limit:
     *    offset:
     *    subLimit:
     *    subOffset:
     * }
     *
     */
    ns.PageExpandUtils = {
        computeRange: function(limit, offset, pageSize) {
            // Example: If pageSize=100 and offset = 130, then we will adjust the offset to 100, and use a subOffset of 30  
            var o = offset || 0;
            var subOffset = o % pageSize;
            o -= subOffset;
         
         
            // Adjust the limit to a page boundary; the original limit becomes the subLimit
            // And we will extend the new limit to the page boundary again.
            // Example: If pageSize=100 and limit = 130, then we adjust the new limit to 200
            var l = limit;
            var subLimit;
            if(l) {
                subLimit = l;
             
                var tmp = l % pageSize;
                l += pageSize - tmp;
            }
        
            var result = {
                limit: l,
                offset: o,
                subLimit: subLimit,
                subOffset:subOffset
            };

            return result;
        }
    };
