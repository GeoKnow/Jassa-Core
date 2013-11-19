(function() {
	
	var ns = Jassa.util;
	
	ns.Iterator = Class.create({
		next: function() {
			throw "Not overridden";
		},
		
		hasNext: function() {
			throw "Not overridden";			
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
	
	
	ns.HashMap = Class.create({
		initialize: function(fnEquals, fnHash) {
			this.fnEquals = fnEquals ? fnEquals : _.isEqual;
			this.fnHash = fnHash ? fnHash : (function(x) { return '' + x; });
			
			this.hashToBucket = {};
		},
		
		put: function(key, val) {
//			if(key == null) {
//				debugger;
//			}
//			console.log('Putting ' + key + ', ' + val);
			var hash = this.fnHash(key);
			
			var bucket = this.hashToBucket[hash];
			if(bucket == null) {
				bucket = [];
				this.hashToBucket[hash] = bucket;
			}
			

			var keyIndex = this._indexOfKey(bucket, key);
			if(keyIndex >= 0) {
				bucket[keyIndex].val = val;
				return;
			}

			var entry = {
				key: key,
				val: val
			};

			bucket.push(entry);
		},
		
		_indexOfKey: function(bucket, key) {
			if(bucket != null) {

				for(var i = 0; i < bucket.length; ++i) {
					var entry = bucket[i];

					var k = entry.key;
					if(this.fnEquals(k, key)) {
						//entry.val = val;
						return i;
					}
				}

			}
			
			return -1;
		},
		
		get: function(key) {
			var hash = this.fnHash(key);
			var bucket = this.hashToBucket[hash];
			var i = this._indexOfKey(bucket, key);
			var result = i >= 0 ? bucket[i].val : null;
			return result;
		},
		
		remove: function(key) {
			var hash = this.fnHash(key);
			var bucket = this.hashToBucket[hash];
			var i = this._indexOfKey(bucket, key);

			var doRemove = i >= 0;
			if(doRemove) {
				bucket.splice(i, 1);
			}
			
			return doRemove;
		},
		
		containsKey: function(key) {
			var hash = this.fnHash(key);
			var bucket = this.hashToBucket[hash];
			var result =  this._indexOfKey(bucket, key) >= 0;
			return result;
		},
		
		keyList: function() {
			var result = [];
			
			_.each(this.hashToBucket, function(bucket) {
				var keys = _(bucket).pluck('key')
				result.push.apply(result, keys);
			});
			
			return result;
		},
		
		entries: function() {
			var result = [];
			
			_.each(this.hashToBucket, function(bucket) {
				result.push.apply(result, bucket);
			});
			
			return result;			
		},
		
		toString: function() {
			var entries = this.entries();
			var entryStrs = entries.map(function(entry) { return entry.key + ': ' + entry.val});
			var result = '{' + entryStrs.join(', ') + '}';
			return result;
		}
	});
	
	
	
	ns.HashBidiMap = Class.create({
		/**
		 * 
		 */
		initialize: function(fnEquals, fnHash, inverseMap) {
			this.forward = new ns.HashMap(fnEquals, fnHash);
			this.inverse = inverseMap ? inverseMap : new ns.HashBidiMap(fnEquals, fnHash, this);
		},
		
		getInverse: function() {
			return this.inverse;
		},
		
		put: function(key, val) {
			this.remove(key);
			
			this.forward.put(key, val);
			this.inverse.forward.put(val, key);
		},
		
		remove: function(key) {
			var priorVal = this.get(key);
			this.inverse.forward.remove(priorVal);			
			this.forward.remove(key);
		},
		
		getMap: function() {
			return this.forward;
		},
		
		get: function(key) {
			var result = this.forward.get(key);
			return result;
		},
		
		keyList: function() {
			var result = this.forward.keyList();
			return result;
		}
	});

	ns.HashSet = Class.create({
		initialize: function(fnEquals, fnHash) {
			
		}
		
		
	});
	
})();
