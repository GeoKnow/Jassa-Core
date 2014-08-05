var Generator = function() {
};

Generator.prototype.next = function() {
    throw "Override me";
};

module.exports = Generator;
