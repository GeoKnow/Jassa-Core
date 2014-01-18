/**
 * A LooseQuadTree data structure.
 * 
 * @param bounds Maximum bounds (e.g. (-180, -90) - (180, 90) for spanning the all wgs84 coordinates)
 * @param maxDepth Maximum depth of the tree
 * @param k The factor controlling the additional size of nodes in contrast to classic QuadTrees.
 * @returns {QuadTree}
 */

(function() {
    
	var ns = Jassa.geo;
	
	ns.QuadTree = function(bounds, maxDepth, k) {
		if(k == undefined) {
			k = 0.25;
		}
		
		this.node = new ns.Node(null, bounds, maxDepth, 0, k); 
	};
	
	ns.QuadTree.prototype.getRootNode = function() {
		return this.node;
	};
	
	/**
	 * Retrieve the node that completely encompasses the given bounds
	 * 
	 * 
	 * @param bounds
	 */
	ns.QuadTree.prototype.aquireNodes = function(bounds, depth) {
		return this.node.aquireNodes(bounds, depth);
	};
	
	
	ns.QuadTree.prototype.query = function(bounds, depth) {
		return this.node.query(bounds, depth);
	};
	
	ns.QuadTree.prototype.insert = function(item) {
		
	};
	
	
	// In order to make the QuadTree self contained, I added a Point and Bounds class
	// However, this makes it necessary to and from OpenLayers.
	// TODO Clarify whether this implementation should be tied to OpenLayers.
	ns.Point = function(x, y) {
		this.x = x;
		this.y = y;
	};
	
	ns.Bounds = function(left, right, bottom, top) {
		this.left = left;
		this.right = right;
		this.bottom = bottom;
		this.top = top;
	};
	
	ns.Bounds.prototype.containsPoint = function(point) {
		return point.x >= this.left && point.x < this.right && point.y >= this.bottom && point.y < this.top;
	};
	
	
	ns.Bounds.prototype.getCenter = function() {
		return new ns.Point(0.5 * (this.left + this.right), 0.5 * (this.bottom + this.top));
	};
	
	ns.Bounds.prototype.getWidth = function() {
		return this.right - this.left; 
	};
	
	ns.Bounds.prototype.getHeight = function() {
		return this.top - this.bottom;
	};
	
	
	/**
	 * Checks for full containment (mere overlap does not yield true)
	 * 
	 * @param bounds
	 * @returns {Boolean}
	 */
	ns.Bounds.prototype.contains = function(bounds) {
		return bounds.left >= this.left && bounds.right < this.right && bounds.bottom >= this.bottom && bounds.top < this.top;
	};
	
	ns.Bounds.prototype.rangeX = function() {
		return new ns.Range(this.left, this.right);
	};
	
	ns.Bounds.prototype.rangeY = function() {
		return new ns.Range(this.bottom, this.top);
	};
	
	ns.Bounds.prototype.overlap = function(bounds) {
		if(!bounds.rangeX || !bounds.rangeY) {
			console.error("Missing range");
		}
		
		var ox = this.rangeX().getOverlap(bounds.rangeX());
		if(!ox) {
			return null;
		}
		
		var oy = this.rangeY().getOverlap(bounds.rangeY());
		if(!oy) {
			return null;
		}
		
		return new ns.Bounds(ox.min, ox.max, oy.min, oy.max);
	};
	
	ns.Bounds.prototype.isOverlap = function(bounds) {
		var tmp = this.overlap(bounds);
		return tmp != null;
	};
	
	ns.Bounds.prototype.toString = function() {
		//return "[" + this.left + ", " + this.bottom + ", " + this.right + ", " + this.top + "]"; 
		return "[" + this.left + " - " + this.right + ", " + this.bottom + " - " + this.top + "]";
	};
	
	ns.Range = function(min, max) {
		this.min = min;
		this.max = max;
	};
	
	ns.Range.prototype.getOverlap = function(other) {
		var min = Math.max(this.min, other.min);
		var max = Math.min(this.max, other.max);
	
		return (min > max) ? null : new ns.Range(min, max); 
	};
	
	// Node
	
	ns.Node = function(parent, bounds, maxDepth, depth, k) {
		this.parent = parent;	
		this._bounds = bounds;
		this._maxDepth = maxDepth;
		this._depth = depth;
		this._k = k;  // expansion factor for loose quad tree [0, 1[ - recommended range: 0.25-0.5
	
		this.isLoaded = false;
		this.children = null;
		
		this.data = {};
		
		this._minItemCount = null; // Concrete minumum item count
		this.infMinItemCount = null; // Inferred minimum item count by taking the sum
		
		// The contained items: id->position (so each item must have an id)
		this.idToPos = {};
		
		this._classConstructor = ns.Node;
	};
	
	ns.Node.prototype.isLeaf = function() {
		return !this.children;
	};
	
	ns.Node.TOP_LEFT = 0;
	ns.Node.TOP_RIGHT = 1;
	ns.Node.BOTTOM_LEFT = 2;
	ns.Node.BOTTOM_RIGHT = 3;
	
	
	ns.Node.prototype.addItem = function(id, pos) {
		this.idToPos[id] = pos;
	};
	
	
	ns.Node.prototype.addItems = function(idToPos) {
		for(id in idToPos) {
			pos = idToPos[id];
			
			this.addItem(id, pos);
		}
	};
	
	
	ns.Node.prototype.removeItem = function(id) {
		delete this.idToPos[id];
	};
	
	/**
	 * Sets the minimum item count on this node and recursively updates
	 * the inferred minimum item count (.infMinItemCount) on its parents.
	 * 
	 * @param value
	 */
	ns.Node.prototype.setMinItemCount = function(value) {
		this._minItemCount = value;
	    this.infMinItemCount = value;
		
		if(this.parent) {
			this.parent.updateInfMinItemCount();
		}
	};
	
	ns.Node.prototype.getMinItemCount = function() {
		return this._minItemCount;
	};
	
	/**
	 * True if either the minItemCount is set, or all children have it set 
	 * FIXME This description is not concise - mention the transitivity
	 * 
	 * @returns
	 */
	ns.Node.prototype.isCountComplete = function() {
		if(this.getMinItemCount() !== null) {
			return true;
		}
		
		if(this.children) {
			var result = _.reduce(
					this.children,
					function(memo, child) {
						return memo && child.isCountComplete();
					},
					true);

			return result;
		}
		
		return false;
	};
	
	//Node.prototype.get
	
	
	ns.Node.prototype.updateInfMinItemCount = function() {
		if(!this.children && this._minItemCount !== null) {
			return;
		}
		
		var sum = 0;
		
		$.each(this.children, function(index, child) {
			if(child._minItemCount !== null) {
				sum += child._minItemCount;
			} else if(child.infMinItemCount) {
				sum += child.infMinItemCount;
			}
		});
		
		this.infMinItemCount = sum;
		
		if(this.parent) {
			this.parent.updateInfMinItemCount();
		}
	};
	
	ns.Node.prototype.getBounds = function() {
		return this._bounds;
	};
	
	
	ns.Node.prototype.getCenter = function() {
		return this._bounds.getCenter();
	};
	
	
	ns.Node.prototype.subdivide = function()
	{
		var depth = this._depth + 1;
		
		var c = this.getCenter();
	
		//console.log("k is " + this._k);
		
		// expansions
		var ew = this._k * 0.5 * this._bounds.getWidth();
		var eh = this._k * 0.5 * this._bounds.getHeight();
		
		this.children = [];
		
		this.children[ns.Node.TOP_LEFT] = new this._classConstructor(this, new ns.Bounds(
			this._bounds.left, 
			c.x + ew, 
			c.y - eh,
			this._bounds.top
		), 
		this._maxDepth, depth, this._k);
		
		this.children[ns.Node.TOP_RIGHT] = new this._classConstructor(this, new ns.Bounds(
			c.x - ew, 
			this._bounds.right, 
			c.y - eh,
			this._bounds.top
		),
		this._maxDepth, depth, this._k);
		
		this.children[ns.Node.BOTTOM_LEFT] = new this._classConstructor(this, new ns.Bounds(
			this._bounds.left, 
			c.x + ew, 
			this._bounds.bottom,
			c.y + eh
		),
		this._maxDepth, depth, this._k);
	
		this.children[ns.Node.BOTTOM_RIGHT] = new this._classConstructor(this, new ns.Bounds(
			c.x - ew, 
			this._bounds.right, 
			this._bounds.bottom,
			c.y + eh
		),
		this._maxDepth, depth, this._k);
		
		
		// Uncomment for debug output
		/*
		console.log("Subdivided " + this._bounds + " into ");
		for(var i in this.children) {
			var child = this.children[i];
			console.log("    " + child._bounds);
		}
		*/
	};
	
	
	ns.Node.prototype._findIndexPoint = function(point) {
		var center = this.getCenter(bounds);
		left = point.x < center.x;
		top = point.y > center.y;
		
		var index; 
		if(left) {
			if(top) {
				index = Node.TOP_LEFT;
			} else {
				index = Node.BOTTOM_LEFT;
			};
		} else {
			if(top) {
				index = Node.TOP_RIGHT;
			} else {
				index = Node.BOTTOM_RIGHT;
			};
		}
		
		return index;	
	};
	
	ns.Node.prototype._findIndex = function(bounds)
	{
		var topLeft = new ns.Point(bounds.left, bounds.top);
		return this._findIndexPoint(topLeft);
	};
	
	ns.Node.prototype.getOverlaps = function(bounds) {
		
	};
	
	
	
	/**
	 * Return loaded and leaf nodes within the bounds
	 * 
	 * @param bounds
	 * @param depth The maximum number of levels to go beyond the level derived from the size of bounds
	 * @returns {Array}
	 */
	ns.Node.prototype.query = function(bounds, depth) {
		var result = [];
		
		this.queryRec(bounds, result);
		
		return result;
	};
	
	ns.Node.prototype.queryRec = function(bounds, result) {
		if(!this._bounds.isOverlap(bounds)) {
			return;
		}
	
		var w = bounds.getWidth() / this._bounds.getWidth();
		var h = bounds.getHeight() / this._bounds.getHeight();
		
		var r = Math.max(w, h);
		
		// Stop recursion on encounter of a loaded node or leaf node or node that exceeded the depth limit
		if(this.isLoaded || !this.children || r >= depth) {
			result.push(this);
			return;
		}
		
		for(i in this.children) {
			var child = this.children[i];
			
			child.queryRec(bounds, depth, result);
		}	
	};
	
	
	
	
	/**
	 * If the node'size is above a certain ration of the size of the bounds,
	 * it is placed into result. Otherwise, it is recursively split until
	 * the child nodes' ratio to given bounds has become large enough.
	 * 
	 * Use example:
	 * If the screen is centered on a certain location, then this method
	 * picks tiles (quad-tree-nodes) of appropriate size (not too big and not too small).
	 * 
	 * 
	 * @param bounds
	 * @param depth
	 * @param result
	 */
	ns.Node.prototype.splitFor = function(bounds, depth, result) {
		/*
		console.log("Depth = " + depth);
		console.log(this.getBounds());
		*/
		
		
		/*
		if(depth > 10) {
			result.push(this);
			return;
		}*/
		
		
		if(!this._bounds.isOverlap(bounds)) {
			return;
		}
		
		// If the node is loaded, avoid splitting it
		if(this.isLoaded) {
			if(result) {
				result.push(this);
			}
			return;
		}
		
		// How many times the current node is bigger than the view rect
		var w = bounds.getWidth() / this._bounds.getWidth();
		var h = bounds.getHeight() / this._bounds.getHeight();
	
		var r = Math.max(w, h);
		//var r = Math.min(w, h);
		
		if(r >= depth || this._depth >= this._maxDepth) {
			if(result) {
				result.push(this);
				//console.log("Added a node");
			}
			return;
		}
		
		if(!this.children) {
			this.subdivide();
		}
		
		for(var i = 0; i < this.children.length; ++i) {
			var child = this.children[i];
			
			//console.log("Split for ",child, bounds);
			child.splitFor(bounds, depth, result);
		}	
	};
	
	
	ns.Node.prototype.aquireNodes = function(bounds, depth) {
		var result = [];
		
		this.splitFor(bounds, depth, result);
		
		return result;
	};
	
	
	ns.Node.prototype.unlink = function() {
		if(!this.parent) {
			return;
		}
		
		for(i in this.parent.children) {
			var child = this.parent.children[i];
			
			if(child == this) {
				this.parent.children = new ns.Node(this.parent, this._bounds, this._depth, this._k);
			}
		}
		
	};
	
})();

