
    /*
    ns.ConstraintBasePath = Class.create(ns.ConstraintBaseSinglePath, {
        initialize: function($super, name, path) {
            $super(name, path);
        }
    });
    */
    
    ns.ConstraintBasePathValue = Class.create(ns.ConstraintBasePath, {
        //classLabel: 'jassa.facete.ConstraintSpecPathValue',

        initialize: function($super, name, path, value) {
            $super(name, path);
            this.value = value;
        },

        getValue: function() {
            return this.value;
        },
        
        equals: function(that) {
            if(!that instanceof ns.ConstraintBasePathValue) {
                return false;
            }
            
            var a = this.name == that.name;
            var b = this.path.equals(that.path);
            var c = this.value.equals(that.value);
            
            var r = a && b &&c;
            return r;
        },
        
        hashCode: function() {
            var result = util.ObjectUtils.hashCode(this, true);
            return result;
        }
    });
    