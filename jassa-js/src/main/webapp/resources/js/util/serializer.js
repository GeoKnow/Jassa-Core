(function() {

    var ns = Jassa.util;

    
    /**
     * 
     * Essentially this is a map from state hash of the object
     * 
     */
    ns.SerializationContext = Class.create({
        initialize: function() {
            // A hash map that compares keys by reference equality
            this.idToState = new ns.HashMap(
                    function(a, b) {
                        return a == b;
                    }, function(obj) {
                        return ns.ObjectUtils.hashCode(obj)
                    }
            );
            
            
        },
        
        getIdToState: function() {
            return this.idToState;
        }
            
            
            // The root key of the object having been serialized
            // (The key may point to an array object)
            //this.rootKey = null;
//            this.idToState = {};
//        },
        
    }); 
    

    ns.Serializer = Class.create({
        initialize: function() {
            this.labelToClass = {};
            
            
            this.labelToFnSerialize = {};
            this.labelToFnDeserialize = {};
            
            
            // A map from class name to a prototype instance
            // (i.e. an instance of the class without any ctor arguments passed in)
            // This is a 'cache' attribute; prototypes are created on demand
            this.classNameToPrototype = {};
        },
    
        registerOverride: function(classLabel, fnSerialize, fnDeserialize) {
            this.labelToFnSerialize[classLabel] = fnSerialize;
            this.labelToFnDeserialize[classLabel] = fnDeserialize;
        },
        
        
        /**
         * Find and index all classes that appear as members of the namespace (a JavaScript Object)
         * 
         */
        indexClasses: function(ns) {
            var tmp = this.findClasses(ns);
            
            _(this.labelToClass).extend(tmp);
            
            return tmp;
        },
        

        findClasses: function(ns) {
            var result = {};
            
            _(ns).each(function(k) {            
                var classLabel = k.classLabel;
                if(classLabel) {
                    result[classLabel] = k;
                }           
            });
            
            return result;
        },


        /**
         * Returns the class label for an instance
         * 
         */
        getLabelForClass: function(obj) {
            var objProto = Object.getPrototypeOf(obj);
            
            var result;
            _(this.labelToClass).find(function(ctor, classLabel) {
                if(objProto == ctor.prototype) {
                    result = classLabel;
                    return true;
                }           
            });

            return result;
        },
        

        getClassForLabel: function(classLabel) {
            var result;
            _(this.labelToClass).find(function(ctor, cl) {
                if(cl === classLabel) {
                    result = ctor
                    return true;
                }           
            });

            return result;      
        },


        serialize: function(obj, context) {
            var result;
            
            if(_(obj).isFunction()) {
                result = undefined;
            }
            else if(_(obj).isArray()) {
                var self = this;
                
                result = _(obj).map(function(item) {
                    var r = self.serialize(item);
                    return r;
                });
            }
            else if(_(obj).isObject()) {
                // Try to figure out the class of the object
                
                
                //var objClassLabel = obj.classLabel;
                
                var classLabel = this.getLabelForClass(obj);

                
                var proto;
                if(classLabel) {
                    
                    var proto = this.classNameToPrototype[classLabel];
                        
                    if(!proto) {
                        var clazz = this.getClassForLabel(classLabel);

                        if(clazz) {

                            try {
                                proto = new clazz();
                                this.classNameToPrototype[classLabel] = proto;
                            }
                            catch(e) {
                                console.log('[WARN] Failed to create a prototype instance of class ' + classLabel, e);
                            }
                        }
                    }                        
                }
                    
                
//              if(obj.toJson) {
//                  // TODO: There must also be a fromJson method
//                  result = obj.toJson();
//              } else {

                result = {}; 
                
                var self = this;
                _(obj).each(function(v, k) {
                    
                    
                    var val = self.serialize(v);
                    
                    if(proto) {
                        var compVal = proto[k];
                        var isEqual = _(val).isEqual(compVal) || (val == null && compVal == null); 
                        //console.log('is equal: ', isEqual, 'val: ', val, 'compVal: ', compVal);
                        if(isEqual) {
                            return;
                        }
                    }
                    
                    if(!_(val).isUndefined()) {
                        result[k] = val;
                    }
                    //serialize(clazz, k, v);
                });

//              }
                
                if(classLabel) {
                    result['classLabel'] = classLabel;
                }
            }
            else {
                result = obj;
                //throw "unhandled case for " + obj;
            }

            return result;
        },

        
        deserialize: function(obj) {
            var result;
            
            if(_(obj).isArray()) {
                result = _(obj).map(function(item) {
                    var r = this.deserialize(item);
                    return r;
                });                
            }
            else if(_(obj).isObject()) {

                var classLabel = obj.classLabel;
                
                if(classLabel) {
                    var classFn = this.getClassForLabel(classLabel);
                    
                    if(!classFn) {
                        throw 'Unknown class label encountered in deserialization: ' + classLabel;
                    }
                    
                    result = new classFn();
                } else {
                    result = {};
                }
                
            
                var self = this;
                _(obj).each(function(v, k) {
                    
                    if(k === 'classLabel') {
                        return;
                    }
                    
                    var val = self.deserialize(v);
                    
                    result[k] = val;
                });


            } else {
                result = obj;
            }
            
        
            return result;
        }
    });
    
    ns.Serializer.singleton = new ns.Serializer();

})();
