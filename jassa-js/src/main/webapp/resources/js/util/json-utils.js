(function() {

    var ns = Jassa.util;
    
    // requires JSONCanonical
    
    ns.JsonUtils = {
        stringifyCyclic: function(obj) {
            var seen = [];
            var result = JSONCanonical.stringify(obj, function(key, val) {
               if (typeof val == "object") {
                    if (seen.indexOf(val) >= 0)
                        return
                    seen.push(val)
                }
                return val;}
            );
            
            return result;
        }
    };
    
    
})();
