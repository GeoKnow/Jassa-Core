var Buffer = function() {};

Buffer.prototype.isFull = function() {
    throw 'Not overridden';
};

module.exports = Buffer;