var IteratorAbstract = require('../util/iterator-abstract');

var ResultSetHashJoin = function(rsA, serviceB, elementB, expr) {
    IteratorAbstract.call(this);

    this.initialize(rsA, serviceB, elementB, expr);
};
// inherit
ResultSetHashJoin.prototype = Object.create(IteratorAbstract.prototype);
// hand back the constructor
ResultSetHashJoin.prototype.constructor = ResultSetHashJoin;


// Expression must be expressed in terms of variable appearing in (the bindings of) rsA and elementB
/**
 *
 * Example:
 *   Given the condition (?a < ?b) with ?a being provided by rsA, and elementB = {?x numberOfSeats ?b}
 *   Then the buffer will be filled with values of (?a), such as [1, 2, 3, 4, 5]...
 *   For each value in the buffer, we create an element {?x numberOfSeats ?b . Filter(?b < 1 ||  ?b < 2 || ?b < 3 ...) }
 *
 * TODO Combine serviceB and elementB into 'thingWhereWeCanLookupTuplesByBindings'
 */
ResultSetHashJoin.prototype.initialize = function(rsA, serviceB, elementB, expr) {
    this.rsA = rsA;
    this.serviceB = serviceB;
    this.elementB = elementB;
    this.expr = expr;

    rsA.getVarsMentioned();
    expr.getVarsMentioned();
};

ResultSetHashJoin.prototype.$prefetch = function() {
    var maxBufferSize = 20;
    var buffer = [];


    // Fill the buffer
    // FIXME: rsA not defined
    while (rsA.hasNext()) {


    }

    // If either the buffer is full or there are no more bindings in rsa,
    // Execute the join
    // FIXME: rsa not defined
    if (buffer.isFull() || !rsa.hasNext()) {

    }

};

module.exports = ResultSetHashJoin;