var IteratorObj = require('./iterator');

var IteratorAbstract = function() {
    IteratorObj.call(this);

    this.initialize();
};
// inherit
IteratorAbstract.prototype = Object.create(IteratorObj.prototype);
// hand back the constructor
IteratorAbstract.prototype.constructor = IteratorAbstract;

IteratorAbstract.prototype.initialize = function() {
    this.current = null;
    this.advance = true;
    this.finished = false;
};

IteratorAbstract.prototype.finish = function() {
    this.finished = true;

    this.close();
    return null;
};

IteratorAbstract.prototype.$prefetch = function() {
    this.current = this.prefetch();
};

IteratorAbstract.prototype.hasNext = function() {
    if (this.advance) {
        this.$prefetch();
        this.advance = false;
    }

    return this.finished === false;
};

IteratorAbstract.prototype.next = function() {
    if (this.finished) {
        throw 'No more elments';
    }

    if (this.advance) {
        this.$prefetch();
    }

    this.advance = true;
    return this.current;
};


IteratorAbstract.prototype.prefetch = function() {
    throw 'Not overridden';
};

module.exports = IteratorAbstract;