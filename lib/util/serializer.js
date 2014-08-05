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
                    result = ctor;
                    return true;
                }           
            });

            return result;      
        },


        serialize: function(obj, context) {
            context = context || new ns.SerializationContext();
            
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
                objToId.put(obj, id);
            }
            
            
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
            else if(_(obj).isObject()) {
            
                result = {};
                
                // Try to figure out the class of the object
                //var objClassLabel = obj.classLabel;
                
                var classLabel = this.getLabelForClass(obj);

                
                // TODO Source of Confusion: We use proto to refer toa prototypal instance of some class for the sake of
                // getting the default values as well as an JavaScript's object prototype... Fix the naming.
                
                // TODO Not sure how stable this proto stuff is across browsers
                var isPrimitiveObject = function(obj) {
                    var result = _(obj).isUndefined() || _(obj).isNull() || _(obj).isBoolean() || _(obj).isNumber() ||
                        _(obj).isDate() || _(obj).isString() || _(obj).isRegExp();
                    return result;
                };
                
                var isSimpleMap = function(obj) {
                    var objProto = obj.prototype || obj.__proto__;
                    
                    var isObject = _(obj).isObject && !isPrimitiveObject(obj);
 
                    var result = isObject && (objProto == null || objProto == Object.__proto__.__proto__);
                    
                    return result;
                };
                
                var isSimpleObject = isPrimitiveObject(obj) || isSimpleMap(obj) || _(obj).isArray();
                
                if(classLabel == null && !isSimpleObject) {
                    console.log('Failed to serialize instance without class label', obj);
                    throw 'Failed to serialize instance without class label';
                }
                
                var proto;
                if(classLabel) {
                    
                    proto = this.classNameToPrototype[classLabel];
                        
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
                var data = {}; 
                
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
                */
                var data = this.serializeAttrs(obj, context, proto);

//              }

                var x = {};
                
                if(classLabel) {
                    x.classLabel = classLabel;
                }

                if(_(data).keys().length > 0) {
                    x['attrs'] = data.attrs;

                    if(data.parent != null) {
                        x['parent'] = data.parent;
                    }
                }
                    

                // If the object is also an array, serialize its members
                // Array members are treated just like objects
                /*
                var self = this;
                if(_(obj).isArray()) {
                    var items = _(obj).map(function(item) {
                        var r = self.serializeRec(item, context);
                        return r;
                    });
                    
                    x['items'] = items;
                }                  
                */
                if(_(obj).isArray()) {
                    x['length'] = obj.length;
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

        
        /**
         * Serialize an object's state, thereby taking the prototype chain into account
         * 
         * TODO: We assume that noone messed with the prototype chain after an instance of
         * an 'conceptual' class has been created.
         * 
         */
        serializeAttrs: function(obj, context, proto) {


            var current = obj;
            var result = {};
            var parent = result;
            
//            while(current != null) {
                var data = parent['attrs'] = {};

                
                var self = this;

                var keys = _(obj).keys(); 
                _(keys).each(function(k) {
                    var v = obj[k];

                //_(obj).each(function(v, k) {
                    
                    // Only traverse own properties
//                    if(!_(obj).has(k)) {
//                        return;
//                    }
                    
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

//                current = current.__proto__;
//                if(current) {
//                    parent = parent['parent'] = {};
//                }
//            };
            
            return result;
        },
        
        
        /**
         * @param graph: Object created by serialize(foo)
         * 
         */
        deserialize: function(graph, context) {
            //context = context || new ns.SerializationContext();
            
            var ref = graph.root;
            var idToState = graph.idToState;
            var idToObj = {};
                        
            var result = this.deserializeRef(ref, idToState, idToObj);
            
            return result;
        },
        
        deserializeRef: function(attr, idToState, idToObj) {
            var ref = attr.ref;
            var value = attr.value;
            
            var result;
            
            if(ref != null) {
                var objectExists = ref in idToObj;

                if(objectExists) {
                    result = idToObj[ref];
                }
                else {
                    result = this.deserializeState(ref, idToState, idToObj);
                    
//                    if(result == null) {
//                        console.log('Could not deserialize: ' + JSON.stringify(state) + ' with context ' + idToState);
//                        throw 'Deserialization error';
//                    }
                }
            }
            else {
                result = value;
            }
            /*
            else if(!_(value).isUndefined()) {
                result = value;
            }
            else if(_(value).isUndefined()) {
                // Leave the value 
            }
            else {
                console.log('Should not come here');
                throw 'Should not come here';
            }
            */
            return result;
        },

        deserializeState: function(id, idToState, idToObj) {
            
            var result;
            
            var state = idToState[id];

            if(state == null || !_(state).isObject()) {
                console.log('State must be an object, was: ', state);
                throw 'Deserialization error';
            }

            var attrs = state.attrs;
            //var items = state.items;
            var classLabel = state.classLabel;
            var length = state.length;
            
            if(classLabel) {
                var classFn = this.getClassForLabel(classLabel);
                
                if(!classFn) {
                    throw 'Unknown class label encountered in deserialization: ' + classLabel;
                }
                
                result = new classFn();
            } else if(length != null) { //items != null) {
                result = [];
            } else {
                result = {};
            }
            
            // TODO get the id
            idToObj[id] = result;
            
        
            var self = this;
            if(attrs != null) {
                var keys = _(attrs).keys(); 
                _(keys).each(function(k) {
                    var ref = attrs[k];

                    var val = self.deserializeRef(ref, idToState, idToObj);
                    
                    result[k] = val;
                });
            }
            
            if(length != null) {
                result.length = length;
            }
            /*
            if(items != null) {
                _(items).each(function(item) {
                    var r = self.deserializeRef(item, idToState, idToObj);

                    result.push(r);
                });                
            }
            */
        
            return result;
        }
        
    });
    
    ns.Serializer.singleton = new ns.Serializer();

})();
