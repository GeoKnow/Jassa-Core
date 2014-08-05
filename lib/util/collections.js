(function() {
	
	var ns = Jassa.util;
	
	ns.MapUtils = {
	    indexBy: function(arr, keyOrFn, result) {
	        result = result || new ns.HashMap();

	        var fnKey;

            if(_(keyOrFn).isString()) {
                fnKey = function(obj) {
                    return obj[keyOrFn];
                }
            } else {
                fnKey = keyOrFn;
            }

	        _(arr).each(function(item) {
	            var key = fnKey(item);
	            result.put(key, item);
	        });
	        
	        return result;
	    }
	};
	
	ns.MultiMapUtils = {
	    get: function(obj, key) {
            return (key in obj)
                ? obj[key]
                : [];
	    },
	    
	    put: function(obj, key, val) {
            var values;
            
            if(key in obj) {
                values = obj[key];
            } else {
                values = [];
                obj[key] = values;
            }
            
            values.push(val);
	    },
	    
	    clear: function(obj) {
            var keys = _(obj).keys();
            _(keys).each(function(key) {
                delete obj[key];
            });	        
	    }
	};
	
	   
    ns.MultiMapObjectArray = Class.create({
        initialize: function() {
            this.entries = {};
        },
    
        clone: function() {
            var result = new ns.MultiMapObjectArray();
            result.addMultiMap(this);
            
            return result;
        },
    
        clear: function() {
            //this.entries = {};
            var keys = _(this.entries).keys();
            _(keys).each(function(key) {
                delete this.entries[key];
            });
        },
    
        addMultiMap: function(other) {
            for(var key in other.entries) {
                var values = other.entries[key];
                
                for(var i = 0; i < values.length; ++i) {
                    var value = values[i];
                    
                    this.put(key, value);
                }           
            }
        },
    
        get: function(key) {
            return (key in this.entries)
                ? this.entries[key]
                : [];
        },
    
        put: function(key, value) {
            var values;
            
            if(key in this.entries) {
                values = this.entries[key];
            } else {
                values = [];
                this.entries[key] = values;
            }
            
            values.push(value);
        },

        removeKey: function(key) {
            delete this.entries[key];
        }
    });
    
	
	
	
	ns.ArrayUtils = {
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
	            while(arr.length > 0) {
	                arr.pop();
	            }
	        },
	
	        replace: function(target, source) {
	            this.clear(target);

	            if(source) {
	                target.push.apply(target, source);
	            }
	        },
	
	
	        filter: function(arr, fn) {
	            var newArr = _(arr).filter(fn);            
	            this.replace(arr, newArr);
	            return arr;
	        },
	        
	        indexesOf: function(arr, val, fnEquals) {
	            fnEquals = fnEquals || ns.defaultEquals;
	            
	            var result = [];

	            _(arr).each(function(item, index) {
	                var isEqual = fnEquals(val, item);
	                if(isEqual) {
	                    result.push(index);
	                }
	            });
	            
	            return result;
	        },
	        
	        // Like jQueries's grep
	        grep: function(arr, fnPredicate) {
                var result = [];

                _(arr).each(function(item, index) {
                    var isTrue = fnPredicate(item, index);
                    if(isTrue) {
                        result.push(index);
                    }
                });
                
                return result;	            
	        },
	        
	        copyWithoutIndexes: function(arr, indexes) {
	            var map = {};
	            _(indexes).each(function(index) {
	                map[index] = true;
	            });
	            
	            var result = [];

	            for(var i = 0; i < arr.length; ++i) {
	                var omit = map[i];
	                if(!omit) {
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
	
	ns.Iterator = Class.create({
		next: function() {
			throw "Not overridden";
		},
		
		hasNext: function() {
			throw "Not overridden";			
		}
	});
	
	
	   ns.IteratorAbstract = Class.create(ns.Iterator, {
	        initialize: function() {
	            this.current = null;
	            this.advance = true;
	            this.finished = false;
	        },
	        
	        finish: function() {
	            this.finished = true;

	            this.close();
	            return null;
	        },

	        $prefetch: function() {
//	          try {
	            this.current = this.prefetch();
//	          }
//	          catch(Exception e) {
//	              current = null;
//	              logger.error("Error prefetching data", e);
//	          }
	        },

	        hasNext: function() {
	            if(this.advance) {
	                this.$prefetch();
	                this.advance = false;
	            }

	            return this.finished == false;
	        },

	        next: function() {
	            if(this.finished) {
	                throw 'No more elments';
	            }

	            if(this.advance) {
	                this.$prefetch();
	            }

	            this.advance = true;
	            return this.current;
	        },

	        
	        prefetch: function() {
	            throw 'Not overridden';
	        }
	    });
	
	
	ns.Entry = Class.create({
		initialize: function(key, value) {
			this.key = key;
			this.value = value;
		},
		
		getKey: function() {
			return this.key;
		},
		
		getValue: function() {
			return this.value;
		},
		
		toString: function() {
			return this.key + "->" + this.value;
		}
	});
	
	/**
	 * Utility class to create an iterator over an array.
	 * 
	 */
	ns.IteratorArray = Class.create(ns.Iterator, {
		initialize: function(array, offset) {
			this.array = array;
			this.offset = offset ? offset : 0;
		},
		
		getArray: function() {
		    return this.array;
		},
	
		hasNext: function() {
			var result = this.offset < this.array.length;
			return result;
		},
		
		next: function() {
			var hasNext = this.hasNext();
			
			var result;
			if(hasNext) {			
				result = this.array[this.offset];
				
				++this.offset;
			}
			else {
				result = null;
			}
			
			return result;
		}		
	});
	
	
	/**
	 * A map that just wraps a json object
	 * Just there to provide a unified map interface
	 */
	ns.ObjectMap = Class.create({
		initialize: function(data) {
			this.data = data ? data : {};
		},
		
		get: function(key) {
			return this.data[key];
		},
		
		put: function(key, val) {
			this.data[key] = val;
		},
		
		remove: function(key) {
			delete this.data[key];
		},
		
		entries: function() {
			throw "Not implemented";
		},
		
		toString: function() {
			return JSON.stringify(this.data); 
		}
	});
	
	
	/**
	 * A map that retains insert order 
	 * 
	 */
	ns.ListMap = Class.create({
	    initialize: function(fnEquals, fnHash) {
	        this.map = new ns.HashMap(fnEquals, fnHash);
	        this.keys = [];
	    },
	    
	    put: function(key, value) {
	        var v = this.map.get(key);
	        if(v) {
	            throw 'Key ' + v + ' already inserted';
	        }
	        
	        this.keys.push(key);
	        this.map.put(key, value);
	    },
	    
	    get: function(key) {
	        var result = this.map.get(key);
	        return result;
	    },
	    
	    getByIndex: function(index) {
	        var key = this.keys[index];
	        var result = this.map.get(key);
	        return result;
	    },
	    
	    entries: function() {
	        var self = this;
	        var result = this.keys.map(function(key) {
	            var value = self.map.get(key);
	            
	            var r = {key: key, val: value};
	            return r;
	        });
	        
	        return result;
	    },
	    
	    remove: function(key) {
	        throw 'Implement me';
	        /*
	        var keys = this.keys;
	        for(var i = 0; i < keys.length; ++i) {
	            
	        }
	        
	        this.map.remove(key);
	        */
	    },
	    
	    removeByIndex: function(index) {
	        var key = this.keys[index];

	        this.remove(key);
	    },
	    
	    keyList: function() {
	        return this.keys;
	    },
	    
	    size: function() {
	        return this.keys.length;
	    }
	});

	
//	// Similar to a hash set, however items are 
//	ns.SetList = Class.create({
//	    
//	})

	ns.HashSet = Class.create({
		initialize: function(fnEquals, fnHash) {
			this.map = new ns.HashMap(fnEquals, fnHash);
		},
		
		add: function(item) {
			this.map.put(item, true);
		},
		
		contains: function(item) {
			var result = this.map.containsKey(item);
			return result;
		},
		
		remove: function(item) {
			this.map.remove(item);
		},
		
		entries: function() {
			var result = _(this.map.entries()).map(function(entry) {
				//return entry.getKey();
				return entry.key;
			});
			
			return result;
		},
		
		toString: function() {
			var entries = this.entries();
			var result = "{" + entries.join(", ") + "}";
			return result;
		}
	});
	
	
	/**
	 * Note: this is a read only collection
	 * 
	 */
	ns.NestedList = Class.create({
	    classLabel: 'jassa.util.NestedList',
	    
	    initialize: function() {
	        this.subLists = [];
	    },

	    /**
	     * Returns an array with the concatenation of all items
	     */
	    getArray: function() {
	        // tmp is an array of arrays
	        var tmp = _(this.subLists).each(function(subList) {
	            return subList.getArray();
	        });
	        
	        var result = _(tmp).flatten(true);
	        
	        return result;
	    },
	    
	    contains: function(item) {
	        var found = _(this.subLists).find(function(subList) {
	            var r = subList.contains(item);
	            return r;
	        });
	
	        var result = !!found;
	        return result;
	    }
	    
	    /*
	    get: function(index) {
	        
	    },
	    */
	});
	
	ns.ArrayList = Class.create({
	   initialize: function(fnEquals) {
	       this.items = [];
	       this.fnEquals = fnEquals || ns.defaultEquals;
	   },
	   
	   setItems: function(items) {
	       this.items = items;
	   },
	   
	   getArray: function() {
	       return this.items;
	   },
	   
	   get: function(index) {
	       var result = this.items[index];
	       return result;
	   },
	   
	   add: function(item) {
	       this.items.push(item);
	   },
	   
	   indexesOf: function(item) {
	       var items = this.items;
	       var fnEquals = this.fnEquals;
	       
	       var result = [];

	       _(items).each(function(it, index) {
               var isEqual = fnEquals(item, it);
               if(isEqual) {
                   result.push(index);
               }
	       });
	       
	       return result;
	   },
	   
	   contains: function(item) {
	       var indexes = this.indexesOf(item);
	       var result = indexes.length > 0;
	       return result;
	   },
	   
	   firstIndexOf: function(item) {
	       var indexes = this.indexesOf(item);
	       var result = (indexes.length > 0) ? indexes[0] : -1; 
	       return result;
	   },

	   lastIndexOf: function(item) {
           var indexes = this.indexesOf(item);
           var result = (indexes.length > 0) ? indexes[indexes.length - 1] : -1; 
           return result;
       },

       /**
        * Removes the first occurrence of the item from the list
        */
       remove: function(item) {
           var index = this.firstIndexOf(item);
           if(index >= 0) {
               this.removeByIndex(index);
           }
       },
       
	   removeByIndex: function(index) {
	       this.items.splice(index, 1);
	   },
	   
	   size: function() {
	       return this.items.length;
	   }
	});
	
	ns.CollectionUtils = {
	    /**
	     * Toggle the membership of an item in a collection and
	     * returns the item's new membership state (true = member, false = not a member)
	     * 
	     * 
	     * @param collection
	     * @param item
	     * 
	     */
		toggleItem: function(collection, item) {
		    var result;

			if(collection.contains(item)) {
				collection.remove(item);
				result = false;
			}
			else {
				collection.add(item);
				result = true;
			}
			
			return result;
		}
	};
	
})();
