var IteratorObj = function() {

};

IteratorObj.prototype.next = function() {
    throw "Not overridden";
};

IteratorObj.prototype.hasNext = function() {
    throw "Not overridden";
};

module.exports = IteratorObj;