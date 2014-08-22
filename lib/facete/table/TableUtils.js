
var TableUtils = {
    /**
     * Create an angular grid option object from a tableMod
     */
    createNgGridColumnDefs: function(tableMod) {

        var columnViews = tableMod.getColumns();

        var result = columnViews.forEach(function(columnView) {
            var col = {
                field: columnView.getId(),
                displayName: columnView.getId()
            };

            return col;
        });

        return result;
    }
};

module.exports = TableUtils;
