var Class = require('../../ext/Class');

var Acc = require('./Acc');


// zip - but only for two arrays
var zip = function(a, b) {
    var result = [];

    var n = Math.max(a.length, b.length);

    for(var i = 0; i < n; ++i) {
        var item = [a[i], b[i]];
        result.push(i);
    }
    
    return result;
};

var compareArray = function(as, bs, op) {
    var zipped = zip(as, bs);
    
    var result = false;
    for (var i = 0; i < zipped.length; ++i) {
       var item = zipped[i];
       var a = item[0];
       var b = item[1];
       
       if (op(a, b)) {
           if (op(b, a)) {
               continue;
           }
           
           result = true;
           break;
       } else { //else if(op(b, a)) {
           if (!op(b, a)) {
               continue;
           }

           result = false;
           break;
       }
    }
//         _(zipped).each(function(item) {
        
//         });
    
//      var result = zipped.every(function(a) {
//          var r = op(a[0], a[1]);
//          return r;
//      });
   
    return result;
};
    
var cmpLessThan = function(a, b) {
    return a < b;
};
    
// TODO Move to utils
// TODO Make configurable
var extractLabelFromUri = function(str) {
    var a = str.lastIndexOf('#');
    var b = str.lastIndexOf('/');
    
    var i = Math.max(a, b);

    var result = (i === str.length) ? str : str.substring(i + 1); 

    if(result === '') {
        result = str; // Rather show the URI than an empty string
    }
    
    return result;
};


var AccBestLabel = Class.create(Acc, {
    initialize: function(bestLiteralConfig) {
        this.bestLiteralConfig = bestLiteralConfig;

        this.bestMatchNode = null;
        this.bestMatchScore = [1000, 1000];
    },
    
    accumulate: function(binding) {
        
        // Evaluate label, property and subject based on the binding
        var blc = this.bestLiteralConfig;

        var property = blc.getPropertyExpr().eval(binding);
        var label = blc.getLabelExpr().eval(binding);
        var subject = blc.getSubjectExpr().eval(binding);

        if(this.bestMatchNode == null && subject.isConstant()) {
            this.bestMatchNode = subject.getConstant().asNode();
        }

        // Determine the score vector for the property and the language
        var propertyScore = -1;
        var langScore;
        
        var l;
        if(property && property.isConstant()) {
            var p = property.getConstant().asNode();
            if(p.isUri()) {
                var propertyUri = p.getUri();
                propertyScore = blc.getLabelPrios().indexOf(propertyUri);
            }
        }
        
        if(label && label.isConstant()) {
            l = label.getConstant().asNode();
            
            var lang = l.isLiteral() ? l.getLiteralLanguage() : 'nolang';
            
//              var val = l.getLiteralLexicalForm();

//              if(val == 'Foobar' || val == 'Baz') {
//                  console.log('here');
//              }

            
            langScore = blc.getPrefLangs().indexOf(lang);
        }
        
        
        var score = [propertyScore, langScore];
        
        var allNonNegative = score.every(function(item) {
            return item >= 0;
        });
        
        if(allNonNegative) {
        
            // Check if the new score is better (less than) than the current best match
            var cmp = compareArray(score, this.bestMatchScore, cmpLessThan);
            if(cmp === true) {
                this.bestMatchScore = score;
                this.bestMatchNode = l;
            }
        }
    },
    
    getValue: function() {
        return this.bestMatchNode;  
    },
    
//    getJson: function() {
//        var result = null;
//        var bestMatchNode = this.bestMatchNode;
//        
//        if(bestMatchNode) {
//            if(bestMatchNode.isUri()) {
//                var uri = bestMatchNode.getUri();
//                result = extractLabelFromUri(uri);
//            }
//            else {
//                result = bestMatchNode.getLiteralValue();
//            }
//        }
//
//        return result;
//    }
});

module.exports = AccBestLabel;
