var Class = require('../ext/Class');

var Accumulator = require('./Accumulator');

var AccumulatorRefCounter = 0;

/**
 * TODO: An aggregatorRef cannot turn itself into a proxy,
 * instead, the parent object needs to be enhanced with proxy capabilities
 *
 * I see two options:
 * (a) We make use of the ns.Field class, and pass each aggregator the field from which it is referenced.
 * This is somewhat ugly, because then the aggregator needs to know how to react when being
 * placed into an array or an object
 *
 * (b) We make a postprocessing step of the (almost) final json and check which properties
 * and array elements point to proxy objects
 *
 * This post processing is maybe the best solution, as it reduces complexity here
 * and we separate the concerns
 *
 */
var AccumulatorRef = Class.create(Accumulator, {
    classLabel: 'jassa.sponate.AccumulatorRef',

    initialize: function(aggregatoRef) {

        this.name = (AccumulatorRefCounter++).toString();

        this.aggregatoRef = aggregatoRef;

        this.json = null;
        // this.map = new ns.MapList();

        this.bindings = [];
    },

    /**
     * The name is used so we can refer to a specific aggregator
     *
     *
     */
    getName: function() {
        return this.name;
    },

    process: function(binding) { // context
        this.bindings.push(binding);

        // context.registryRef.addRef(this, binding)
    },

    getJson: function() { // retainRdfNodes
        return this.json;
    },

    // The sponate system takes care of resolving references
    setJson: function(json) {
        this.json = json;
    },
});

module.exports = AccumulatorRef;
