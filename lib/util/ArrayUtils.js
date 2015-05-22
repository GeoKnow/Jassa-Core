var ObjectUtils = require('./ObjectUtils');

var ArrayUtils = {

    compactTrailingNulls: function(arr) {
        while(arr.length && arr[arr.length-1] == null){
            arr.pop();
        }
    },


    indexesOf: function(arr, item, equalsFn) {
        equalsFn = equalsFn || ObjectUtils.isEqual;

        var result = [];

        arr.forEach(function(it, index) {
            var isEqual = equalsFn(item, it);
            if (isEqual) {
                result.push(index);
            }
        });

        return result;
    },

    firstIndexOf: function(arr, item, equalsFn) {
        var indexes = ArrayUtils.indexesOf(arr, item, equalsFn);
        var result = (indexes.length > 0) ? indexes[0] : -1;
        return result;
    },

    contains: function(arr, item, equalsFn) {
        var indexes = ArrayUtils.indexesOf(arr, item, equalsFn);
        var result = indexes.length > 0;
        return result;
    },

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

    find: function(arr, predicateFn) {
        var result = null;

        for(var i = 0; i < arr.length; ++i) {
            var item = arr[i];
            var isTrue = predicateFn(item);
            if(isTrue) {
                result = item;
                break;
            }
        }

        return result;
    },

    indexOf: function(arr, item, fnEquals) {
        fnEquals = fnEquals || ObjectUtils.isEqual;
        var result = -1;

        for(var i = 0; i < arr.length; ++i) {
            var it = arr[i];

            if(fnEquals(item, it)) {
                result = i;
                break;
            }
        }

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

    // Remove an item by strict equality
    removeItemStrict: function(arr, item) {
        var index = arr.indexOf(item);

        if (index > -1) {
            this.removeIndexes(arr, [index]);
        }

        return arr;
    },

    removeIndexes: function(arr, indexes) {
        var tmp = this.copyWithoutIndexes(arr, indexes);
        this.replace(arr, tmp);
        return arr;
    },

    removeByGrep: function(arr, fnPredicate) {
        var indexes = this.grep(arr, fnPredicate);
        this.removeIndexes(arr, indexes);
    },


    removeItem: function(arr, item, equalsFn) {
        var index = ArrayUtils.firstIndexOf(arr, item, equalsFn);
        if (index >= 0) {
            arr.splice(index, 1);
        }
    },

};

module.exports = ArrayUtils;
