
    /**
     * 
     * @param direction
     * @param resource
     * @returns {ns.Step}
     */
    ns.Step = Class.create({
        
        initialize: function(propertyName, isInverse) {
            this.type = "property";
            this.propertyName = propertyName;
            this._isInverse = isInverse;
        },
    
        toJson: function() {
            var result = {
                isInverse: this.isInverse,
                propertyName: this.propertyName
            };
            
            return result;
        },
        
        getPropertyName: function() {
            return this.propertyName;
        },

        isInverse: function() {
            return this._isInverse;
        },


        equals: function(other) {
            return _.isEqual(this, other);
        },

        toString: function() {
            if(this._isInverse) {
                return "<" + this.propertyName;
            } else {
                return this.propertyName;
            }
        },
        
        createElement: function(sourceVar, targetVar, generator) {
            var propertyNode = sparql.Node.uri(this.propertyName);
            
            var triple;
            if(this._isInverse) {
                triple = new rdf.Triple(targetVar, propertyNode, sourceVar);
            } else {
                triple = new rdf.Triple(sourceVar, propertyNode, targetVar);
            }
            
            var result = new sparql.ElementTriplesBlock([triple]);
            
            return result;
        }
    });
    
    ns.Step.classLabel = 'Step';

    
    /**
     * Create a Step from a json specification:
     * {
     *     propertyName: ... ,
     *     isInverse: 
     * }
     * 
     * @param json
     */
    ns.Step.fromJson = function(json) {
    // FIXME: checkNotNull cannot be resolved
        var propertyName = checkNotNull(json.propertyName);
        var isInverse = json.IsInverse();
        
        var result = new ns.Step(propertyName, isInverse);
        return result;
    };
    
    ns.Step.parse = function(str) {
        var result;
        if(_(str).startsWith("<")) {
            result = new ns.Step(str.substring(1), true);
        } else {
            result = new ns.Step(str, false);
        }
        return result;
    };
