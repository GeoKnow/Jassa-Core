    ns.QueryFactoryFacetTable = Class.create(ns.QueryFactory, {
        initialize: function(tableConfigFacet) {
            this.tableConfigFacet = tableConfigFacet;
        },

        createQuery: function() {
            var facetConfig = this.tableConfigFacet.getFacetConfig();

            // TODO Possible source of confusion: the config uses a collection for paths, but here we switch to a native array
            var paths = this.tableConfigFacet.getPaths();//.getArray();
            var tableMod = this.tableConfigFacet.getTableMod();


            var elementFactory = new ns.ElementFactoryFacetPaths(facetConfig, paths);

            var queryFactory = new ns.QueryFactoryTableMod(elementFactory, tableMod);

            var result = queryFactory.createQuery();

            return result;
        }
    });
