var Class = require('../../ext/Class');

var ObjectUtils = require('../../util/ObjectUtils');
var ConstraintBasePath = require('./ConstraintBasePath');


var ConstraintBasePathValue = Class.create(ConstraintBasePath, {
    //classLabel: 'jassa.facete.ConstraintSpecPathValue',

    initialize: function($super, name, path, value) {
        $super(name, path);
        this.value = value;
    },

    getValue: function() {
        return this.value;
    },
    
    equals: function(that) {
        if(!(that instanceof ConstraintBasePath)) {
            return false;
        }
        
        var a = this.name == that.name;
        var b = this.path.equals(that.path);
        var c = this.value.equals(that.value);
        
        var r = a && b &&c;
        return r;
    },
    
    hashCode: function() {
        var result = ObjectUtils.hashCode(this, true);
        return result;
    }
});

module.exports = ConstraintBasePathValue;
    
