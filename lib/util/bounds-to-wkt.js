var boundsToWkt = function(bounds) {
    var ax = bounds.left;
    var ay = bounds.bottom;
    var bx = bounds.right;
    var by = bounds.top;

    var result = 'POLYGON((' + ax + ' ' + ay + ',' + bx + ' ' + ay +
        ',' + bx + ' ' + by + ',' + ax + ' ' + by + ',' + ax + ' ' + ay + '))';

    return result;
};

module.exports = boundsToWkt;
