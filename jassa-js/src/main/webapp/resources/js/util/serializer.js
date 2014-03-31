(function() {

    var ns = Jassa.util;

    
    /**
     * 
     * Essentially this is a map from state hash of the object
     * 
     */
    ns.SerializationContext = Class.create({
        initialize: function() {
            this._nextId = 1;
            
            // A hash map that compares keys by reference equality
            this.objToId = new ns.HashMap(
                    function(a, b) {
                        return a == b;
                    }, function(obj) {
                        return ns.ObjectUtils.hashCode(obj)
                    }
            );
            
            
            this.idToState = {};
        },
        
        nextId: function() {
            var result = '' + this._nextId++;
            return result;
        },
        
        getIdToState: function() {
            return this.idToState;
        },
        
        getObjToId: function() {
            return this.objToId;
        }
            
            
            // The root key of the object having been serialized
            // (The key may point to an array object)
            //this.rootKey = null;
//            this.idToState = {};
//        },
        
    }); 
    

    ns.Serializer = Class.create({
        initialize: function() {
            /**
             * A map from class label to the class object
             * 
             */
            this.classNameToClass = {};
                        
            /**
             * A map from class label to serialization function  
             */
            this.classNameToFnSerialize = {};
            
            
            /**
             * A map from class label to deserialization function 
             */
            this.classNameToFnDeserialize = {};
            
            /**
             * A map from class name to a prototype instance
             * (i.e. an instance of the class without any ctor arguments passed in)
             * This is a 'cache' attribute; prototypes are created on demand
             */
            this.classNameToPrototype = {};
        },
    
        registerOverride: function(classLabel, fnSerialize, fnDeserialize) {
            this.classNameToFnSerialize[classLabel] = fnSerialize;
            this.classNameToFnDeserialize[classLabel] = fnDeserialize;
        },
        
        
        /**
         * Find and index all classes that appear as members of the namespace (a JavaScript Object)
         * 
         */
        indexClasses: function(ns) {
            var tmp = this.findClasses(ns);
            
            _(this.classNameToClass).extend(tmp);
            
            return tmp;
        },
        

        findClasses: function(ns) {
            var result = {};
            
            _(ns).each(function(k) {
                // TODO Use custom function to obtain class names
                var classLabel = k.classLabel || (k.prototype ? k.prototype.classLabel : null);
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
            _(this.classNameToClass).find(function(ctor, classLabel) {
                if(objProto == ctor.prototype) {
                    result = classLabel;
                    return true;
                }           
            });

            return result;
        },
        

        getClassForLabel: function(classLabel) {
            var result;
            _(this.classNameToClass).find(function(ctor, cl) {
                if(cl === classLabel) {
                    result = ctor
                    return true;
                }           
            });

            return result;      
        },


        serialize: function(obj, context) {
            if(!context) {
                context = new ns.SerializationContext();
            }
            
            var data = this.serializeRec(obj, context);
            
            var result = {
                root: data,
                idToState: context.getIdToState()
            };
            
            
            return result;
        },
        
        serializeRec: function(obj, context) {
            var result;


            //var id = context.getOrCreateId(obj);
            
            // Get or create an ID for the object
            var objToId = context.getObjToId();
            var id = objToId.get(obj);
            
            if(!id) {
                id = context.nextId();
            }

            objToId.put(id, obj);
            
            
            var idToState = context.getIdToState();
            var state = idToState[id];
            
            if(state) {
                result = {
                    ref: id
                };
            }            
            else if(_(obj).isFunction()) {
                result = undefined;
            }
            else if(_(obj).isArray()) {
                var self = this;
                
                var items = _(obj).map(function(item) {
                    var r = self.serializeRec(item, context);
                    return r;
                });
                
                result = {
                    items: items
                };
            }
            else if(_(obj).isObject()) {
            
                result = {};
                
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

                if(!proto) {
                    proto = {};
                }

                
                /*
                var objChainItem = obj;
                
                while(objChainItem != null) {
                    var propNames = protoChainItem.getOwnPropertyNames();
                    
                    
                    objChainItem = obj.prototype;
                    protoChainItem = proto ? proto.prototype;
                }
                */
                
//              if(obj.toJson) {
//                  // TODO: There must also be a fromJson method
//                  result = obj.toJson();
//              } else {

                data = {}; 
                
                var self = this;
                _(obj).each(function(v, k) {
                    
                    
                    var val = self.serializeRec(v, context);
                    
                    var compVal = proto[k];
                    var isEqual = _(val).isEqual(compVal) || (val == null && compVal == null); 
                    //console.log('is equal: ', isEqual, 'val: ', val, 'compVal: ', compVal);
                    if(isEqual) {
                        return;
                    }
                    
                    if(!_(val).isUndefined()) {
                        data[k] = val;
                    }
                    //serialize(clazz, k, v);
                });

//              }

                var x = {
                    attrs: data
                };

                if(classLabel) {
                    x.classLabel = classLabel;
                }
                
                
                idToState[id] = x;

                result = {
                    ref: id
                };
                
            }
            else {
                //result = {type: 'literal', 'value': obj};//null; //obj;
                result = {
                    value: obj
                };
                //throw "unhandled case for " + obj;
            }

            
            //return result;
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
