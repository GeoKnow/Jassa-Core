var Class = require('../ext/class');
/**
 * Takes a query and upon calling 'next' updates its limit and offset values accordingly
 *
 */
var QueryPaginator = Class.create({
    initialize: function(query, pageSize) {
        this.query = query;

        var queryOffset = query.getOffset();
        var queryLimit = query.getLimit();

        this.nextOffset = queryOffset || 0;
        this.nextRemaining = queryLimit === null ? null : queryLimit;

        this.pageSize = pageSize;
    },

    getPageSize: function() {
        return this.pageSize;
    },

    // Returns the next limit and offset
    next: function() {
        var offset = this.nextOffset === 0 ? null : this.nextOffset;
        this.query.setOffset(offset);

        if (this.nextRemaining === null) {
            this.query.setLimit(this.pageSize);
            this.nextOffset += this.pageSize;
        } else {
            var limit = Math.min(this.pageSize, this.nextRemaining);
            this.nextOffset += limit;
            this.nextRemaining -= limit;

            if (limit === 0) {
                return null;
            }

            this.query.setLimit(limit);
        }

        return this.query;
    },
});

module.exports = QueryPaginator;
