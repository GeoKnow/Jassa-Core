var ElementFactory = function() {
};

ElementFactory.prototype.createElement = function() {
    throw 'Not overridden';
};

module.exports = ElementFactory;
