var defaultEquals = require('./default-equals');

var ArrayUtils = {
    addAll: function(arr, items) {
        return arr.push.apply(arr, items);
    },

    chunk: function(arr, chunkSize) {
        var result = [];
        for (var i = 0; i < arr.length; i += chunkSize) {
            var chunk = arr.slice(i, i + chunkSize);

            result.push(chunk);
        }

        return result;
    },

    clear: function(arr) {
        while (arr.length > 0) {
            arr.pop();
        }
    },

    replace: function(target, source) {
        this.clear(target);

        if (source) {
            target.push.apply(target, source);
        }
    },


    filter: function(arr, fn) {
        var newArr = arr.filter(fn);
        this.replace(arr, newArr);
        return arr;
    },

    indexesOf: function(arr, val, fnEquals) {
        fnEquals = fnEquals || defaultEquals;

        var result = [];

        arr.forEach(function(item, index) {
            var isEqual = fnEquals(val, item);
            if (isEqual) {
                result.push(index);
            }
        });

        return result;
    },

    // Like jQueries's grep
    grep: function(arr, fnPredicate) {
        var result = [];

        arr.forEach(function(item, index) {
            var isTrue = fnPredicate(item, index);
            if (isTrue) {
                result.push(index);
            }
        });

        return result;
    },

    copyWithoutIndexes: function(arr, indexes) {
        var map = {};
        indexes.forEach(function(index) {
            map[index] = true;
        });

        var result = [];

        for (var i = 0; i < arr.length; ++i) {
            var omit = map[i];
            if (!omit) {
                result.push(arr[i]);
            }
        }

        return result;
    },

    removeIndexes: function(arr, indexes) {
        var tmp = this.copyWithoutIndexes(arr, indexes);
        this.replace(arr, tmp);
        return arr;
    },

    removeByGrep: function(arr, fnPredicate) {
        var indexes = this.grep(arr, fnPredicate);
        this.removeIndexes(arr, indexes);
    }
};

module.exports = ArrayUtils;