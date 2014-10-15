var Class = require('../ext/Class');
var Point = require('./Point');
var Bounds = require('./Bounds');
var reduce = require('lodash.reduce');


var QuadTreeNode = Class.create({
    initialize: function(parent, bounds, maxDepth, depth, k, parentChildIndex) {
        this.parent = parent;
        this.parentChildIndex = parentChildIndex;

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

        this._classConstructor = QuadTreeNode;
    },

    getId: function() {
        var parent = this.parent;
        var parentId = parent ? parent.getId() : '';

        var indexId = this.parentChildIndex != null ? this.parentChildIndex : 'r'; // r for root
        var result = parentId + indexId;
        return result;
    },

    isLeaf: function() {
        return this.children == null;
    },


    addItem: function(id, pos) {
        this.idToPos[id] = pos;
    },


    addItems: function(idToPos) {
        for(var id in idToPos) {
            var pos = idToPos[id];

            this.addItem(id, pos);
        }
    },


    removeItem: function(id) {
        delete this.idToPos[id];
    },

    /**
     * Sets the minimum item count on this node and recursively updates
     * the inferred minimum item count (.infMinItemCount) on its parents.
     *
     * @param value
     */
    setMinItemCount: function(value) {
        this._minItemCount = value;
        this.infMinItemCount = value;

        if(this.parent) {
            this.parent.updateInfMinItemCount();
        }
    },

    getMinItemCount: function() {
        return this._minItemCount;
    },

    /**
     * True if either the minItemCount is set, or all children have it set
     * FIXME This description is not concise - mention the transitivity
     *
     * @returns
     */
    isCountComplete: function() {
        if(this.getMinItemCount() != null) {
            return true;
        }

        if(this.children) {
            var result = reduce(
                    this.children,
                    function(memo, child) {
                        return memo && child.isCountComplete();
                    },
                    true);

            return result;
        }

        return false;
    },

    updateInfMinItemCount: function() {
        if(!this.children && this._minItemCount != null) {
            return;
        }

        var sum = 0;

        this.children.forEach(function(child, index) {
            if(child._minItemCount != null) {
                sum += child._minItemCount;
            } else if(child.infMinItemCount) {
                sum += child.infMinItemCount;
            }
        });

        this.infMinItemCount = sum;

        if(this.parent) {
            this.parent.updateInfMinItemCount();
        }
    },

    getBounds: function() {
        return this._bounds;
    },


    getCenter: function() {
        return this._bounds.getCenter();
    },


    subdivide: function() {
        var depth = this._depth + 1;

        var c = this.getCenter();

        //console.log("k is " + this._k);

        // expansions
        var ew = this._k * 0.5 * this._bounds.getWidth();
        var eh = this._k * 0.5 * this._bounds.getHeight();

        this.children = [];

        this.children[QuadTreeNode.TOP_LEFT] = new this._classConstructor(this, new Bounds(
            this._bounds.left,
            c.y - eh,
            c.x + ew,
            this._bounds.top
        ),
        this._maxDepth, depth, this._k, QuadTreeNode.TOP_LEFT);

        this.children[QuadTreeNode.TOP_RIGHT] = new this._classConstructor(this, new Bounds(
            c.x - ew,
            c.y - eh,
            this._bounds.right,
            this._bounds.top
        ),
        this._maxDepth, depth, this._k, QuadTreeNode.TOP_RIGHT);

        this.children[QuadTreeNode.BOTTOM_LEFT] = new this._classConstructor(this, new Bounds(
            this._bounds.left,
            this._bounds.bottom,
            c.x + ew,
            c.y + eh
        ),
        this._maxDepth, depth, this._k, QuadTreeNode.BOTTOM_LEFT);

        this.children[QuadTreeNode.BOTTOM_RIGHT] = new this._classConstructor(this, new Bounds(
            c.x - ew,
            this._bounds.bottom,
            this._bounds.right,
            c.y + eh
        ),
        this._maxDepth, depth, this._k, QuadTreeNode.BOTTOM_RIGHT);


        // Uncomment for debug output
        /*
        console.log("Subdivided " + this._bounds + " into ");
        for(var i in this.children) {
            var child = this.children[i];
            console.log("    " + child._bounds);
        }
        */
    },


//    _findIndexPoint: function(point) {
//    // FIXME: bounds not defined
//        var center = this.getCenter(bounds);
//        var left = point.x < center.x;
//        var top = point.y > center.y;
//
//        var index;
//        if(left) {
//            if(top) {
//                index = Node.TOP_LEFT;
//            } else {
//                index = Node.BOTTOM_LEFT;
//            }
//        } else {
//            if(top) {
//                index = Node.TOP_RIGHT;
//            } else {
//                index = Node.BOTTOM_RIGHT;
//            }
//        }
//
//        return index;
//    },

//    _findIndex: function(bounds) {
//        var topLeft = new Point(bounds.left, bounds.top);
//        return this._findIndexPoint(topLeft);
//    },

    getOverlaps: function(bounds) {

    },



    /**
     * Return loaded and leaf nodes within the bounds
     *
     * @param bounds
     * @param depth The maximum number of levels to go beyond the level derived from the size of bounds
     * @returns {Array}
     */
    query: function(bounds, depth) {
        var result = [];

        this.queryRec(bounds, result, depth);

        return result;
    },

    queryRec: function(bounds, result, depth) {
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

        for(var i in this.children) {
            var child = this.children[i];
            // FIXME: depth is not defined
            child.queryRec(bounds, depth, result);
        }
    },




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
    splitFor: function(bounds, depth, result) {
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
    },


    aquireNodes: function(bounds, depth) {
        var result = [];

        this.splitFor(bounds, depth, result);

        return result;
    },


    unlink: function() {
        if(!this.parent) {
            return;
        }

        for(var i in this.parent.children) {
            var child = this.parent.children[i];

            if(child == this) {
                this.parent.children = new QuadTreeNode(this.parent, this._bounds, this._depth, this._k);
            }
        }
    }
});


QuadTreeNode.TOP_LEFT = 0;
QuadTreeNode.TOP_RIGHT = 1;
QuadTreeNode.BOTTOM_LEFT = 2;
QuadTreeNode.BOTTOM_RIGHT = 3;

module.exports = QuadTreeNode;
