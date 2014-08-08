var joinElements = function(separator, elements) {
    var strs = elements.map(function(element) { return '' + element; });
    var filtered = strs.filter(function(str) { return str.length !== 0; });
    
    return filtered.join(separator);
};

module.exports = joinElements;
