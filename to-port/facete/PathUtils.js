
    ns.PathUtils = {
        parsePathSpec: function(pathSpec) {
            var result = (pathSpec instanceof ns.Path) ? pathSpec : ns.Path.parse(pathSpec); 

            return result;
        }                   
    };

    