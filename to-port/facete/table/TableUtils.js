    ns.TableUtils = {
        /**
         * Create an angular grid option object from a tableMod
         */
        createNgGridColumnDefs: function(tableMod) {

            var columnViews = tableMod.getColumns();
            
            var result = _(columnViews).each(function(columnView) {
                var col = {
                    field: columnView.getId(),
                    displayName: columnView.getId()
                };
                
                return col;
            });
            
            return result;
        }
    };
    