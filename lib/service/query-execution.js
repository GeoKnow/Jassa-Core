var QueryExecution = function() {};

QueryExecution.prototype.execSelect = function() {
    throw "Not overridden";
};

QueryExecution.prototype.execAsk = function() {
    throw "Not overridden";
};

QueryExecution.prototype.execDescribeTriples = function() {
    throw "Not overridden";
};

QueryExecution.prototype.execConstructTriples = function() {
    throw "Not overridden";
};

QueryExecution.prototype.setTimeout = function() {
    throw "Not overridden";
};

module.exports = QueryExecution;
