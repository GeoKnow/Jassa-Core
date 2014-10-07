
var Criteria = Class.create({
    initialize: function(v) {
        this.v = v;
        this.orders = [];
        this.restrictions = [];
        this.subCriteria = [];
    },

    createCriteria: function(property, alias, joinType) {
        var result = new Criteria();

        this.subCriteria.push({
            property: property,

        });
    },

    add: function(criterion) {

    },

    getVar: function() {
        return this.v;
    },

    addOrder: function(order) {
        this.orders.push(order);
    },

    toSparqlString: function() {

    },

    createListService: function() {

    },
});

module.exports = Criteria;
