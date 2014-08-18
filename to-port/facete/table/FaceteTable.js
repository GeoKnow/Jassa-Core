
    /*
     * TODO: How to connect this class with a facetTreeConfig?
     * We might need a FacetNodeFactoryFacetTreeConfig
     * 
     */
    ns.FaceteTable = Class.create({
        initialize: function() {
            //this.pathVarMap = pathVarMap;// Formerly called facetNode
            // FIXME: varNode not defined!!!
            this.varNode = varNode;            
            this.paths = new util.ArrayList();
            this.tableMod = tableMod;
        },

        getPaths: function() {
            return this.paths;
        },
        
        getTableMod: function() {
            return this.tableMod;
        },
        
        togglePath: function(path) {
            // Updates the table model accordingly
            var status = util.CollectionUtils.toggleItem(this.paths, path);
            
            var target = this.varNode.forPath(path);
            var varName = target.getVarName();
            
            if(status) {
                // FIXME: this.tableMode not defined
                this.tableMode.addColumn(varName);
            }
            else {
                // FIXME: this.tableMode not defined
                this.tableMode.removeColumn(varName);
            }
        }
    });
    