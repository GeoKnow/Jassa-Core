    
    /**
     * Object that holds configuration for modifications to a table.
     * Needs to be interpreted by another object.
     * 
     * { myCol1: {sortDir: 1, aggName: sum, path: foo}, ... }
     * - sum(?varForFoo) As myCol1
     * 
     */
    ns.TableMod = Class.create({
        initialize: function() {
            this.columnIds = []; // Array of active column ids

            this.colIdToColView = {};
            this.sortConditions = []; // Array of sortConditions in which to apply sort conditions

            this.colIdToAgg = {};
            
            this.limitAndOffset = new ns.LimitAndOffset();
            
            this._isDistinct = true;
        },
        
        isDistinct: function() {
            return this._isDistinct;
        },
        
        setDistinct: function(isDistinct) {
            this._isDistinct = isDistinct;
        },
        
        getColumnIds: function() {
            return this.columnIds;
        },
        
        getColumn: function(id) {
            return this.colIdToColView[id];
        },
        
        // Returns the active columns
        getColumns: function() {
            var self = this;
            var result = _(this.columnIds).map(function(columnId) {
                var r = self.colIdToColView[columnId];
                
                return r;
            });
            
            
            return result;
        },
        
        getSortConditions: function() {
            return this.sortConditions;
        },
        
        getLimitAndOffset: function() {
            return this.limitAndOffset;
        },
        
        getAggregator: function(columnId) {
            var result = this.colIdToAgg[columnId];
            return result;
        },
        
        getAggregators: function() {
            return this.colIdToAgg;
        },
        
        //setAggregator: function()
        
        /**
         * Adds a column based on a ColumnState object.
         * 
         * @param suppressActive default: false; true: Do not add the id to the array of active columns 
         */
        addColumn: function(columnId, suppressActive) {
            var colView = this.colIdToColView[columnId];
            if(colView) {
                throw 'Column ' + columnId + ' already part of the table';
            }
            
            colView = new ns.ColumnView(this, columnId);            
            this.colIdToColView[columnId] = colView;
            
            if(!suppressActive) {
                this.columnIds.push(columnId);
            }
            
            // TODO Fail on duplicate
            /*
            var columnId = columnState.getId();
            this.columnIds.push(columnId);
            
            this.idToState[columnId] = columnState;
            */
            
            return colView;
        },
        
        /**
         * Removes a column by id
         * 
         * Also removes dependent objects, such as sort conditions and aggregations 
         */
        removeColumn: function(columnId) {
            delete this.colIdToColView[columnId];
            
            var self = this;
            util.ArrayUtils.filter(this.columnIds, function(cid) {            
                var r = columnId != cid;
                return r;
            });
            
            util.ArrayUtils.filter(this.sortConditions, function(sc) {
                var r = columnId != sc.getColumnId();
            });

            delete this.colIdToAgg[columnId];
        }
    });
