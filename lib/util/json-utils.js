(function() {

    var ns = Jassa.util;
    
    // requires JSONCanonical
    
    ns.JsonUtils = {
        stringifyCyclic: function(obj, fn) {
            var seen = [];
            var result = JSONCanonical.stringify(obj, function(key, val) {
               if (_(val).isObject()) {
                    if (seen.indexOf(val) >= 0) {
                        return;
                    }
                    
                    seen.push(val);
                    
                    if(fn) {
                        val = fn(key, val);
                    }
                }
                return val;
            });
            
            return result;
        }
    };
    
    
    ns.ObjectUtils = {

        /**
         * Recursively iterate the object tree and use a .hashCode function if available
         * TODO Add support to exclude attributes
         */
        hashCode: function(obj, skipOnce) {

            var result = ns.JsonUtils.stringifyCyclic(obj, function(key, val) {
                
                var r = null;

                if(!skipOnce && _(val).isObject()) {

                    var hashFnName = _(ns.ObjectUtils.defaultHashFnNames).find(function(name) {
                        return _(val[name]).isFunction();
                    });
                    
                    var fnHashCode = val[hashFnName];

                    if(fnHashCode) {
                        r = fnHashCode.apply(val);
                    } else {
                        r = val;
                    }

                } else {
                    r = val;
                }
                
                if(skipOnce) {
                    skipOnce = false;
                }
                
                return r;
            });
            
            return result;
        }
    };
    
    ns.ObjectUtils.defaultHashFnNames = ['hashCode']
})();
