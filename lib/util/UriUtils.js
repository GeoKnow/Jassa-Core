
var UriUtils = {

    isValidUri: function(str) {
        var r = true;

        r = r && str.indexOf(' ') < 0;
        r = r && str.indexOf('<') < 0;
        r = r && str.indexOf('>') < 0;

        return r;
    },

    extractLabel: function(str) {
        var a = str.lastIndexOf('#');
        var b = str.lastIndexOf('/');

        var i = Math.max(a, b);

        var result = (i === str.length) ? str : str.substring(i + 1);

        if(result === '') {
            result = str; // Rather show the URI than an empty string
        }

        return result;
    }
};

module.exports = UriUtils;
