    ns.Aggregator = Class.create({
        initialize: function(name, attrs) {
            this.name = name;
            this.attrs = attrs; // Optional attributes;
        },
        
        getName: function() {
            return this.name;
        },
        
        getAttrs: function() {
            return this.attrs;
        }
    });

    