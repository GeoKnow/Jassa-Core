    /**
     * Note used yet.
     * searchMode: exact, regex, beginsWith, endsWith
     */
    ns.FilterString = Class.create({
        initialize: function(str, mode) {
            this.str = str;
            this.mode = mode;
        }
    });
