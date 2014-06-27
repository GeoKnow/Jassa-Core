(function() {

    var util = jassa.util;
    
    var ns = jassa.service;
    
    // TODO Rename 'id(s)' to 'key(s)'
    
    ns.LookupService = Class.create({
        getIdStr: function(id) {
            console.log('Not overridden');
            throw 'Not overridden';
        },

        /**
         * This method must return a promise for a Map<Id, Data>
         */
        lookup: function(ids) {
            console.log('Not overridden');
            throw 'Not overridden';
        }
    });
    
    
    /**
     * This function must convert ids to unique strings
     * Only the actual service (e.g. sparql or rest) needs to implement it
     * Layers on top of it (e.g. caching, delaying) will then delegate to the
     * inner-most getIdStr function.
     *
     */
    ns.LookupServiceBase = Class.create(ns.LookupService, {
        getIdStr: function(id) {
            var result = '' + id;
            return result;
        }
    });

    ns.LookupServiceDelegateBase = Class.create(ns.LookupService, {
        initialize: function(delegate) {
            this.delegate = delegate;
        },

        getIdStr: function(id) {
            var result = this.delegate.getIdStr(id);
            return result;
        }
    });

    /**
     * Lookup service is simply a service that can asynchronously map ids to documents (data).
     *
     */
    ns.LookupServiceCache = Class.create(ns.LookupServiceDelegateBase, {
        initialize: function($super, delegate, requestCache) {
            $super(delegate);
            this.requestCache = requestCache || new ns.RequestCache();
        },
        
        /**
         * This method must return a promise for the documents
         */
        lookup: function(ids) {
            var self = this;

            //console.log('cache status [BEFORE] ' + JSON.stringify(self.requestCache));

            // Make ids unique
            var uniq = _(ids).uniq(false, function(id) {
                var idStr = self.getIdStr(id);
                return idStr;
            });

            var resultMap = new util.HashMap();

            var resultCache = this.requestCache.getResultCache();
            var executionCache = this.requestCache.getExecutionCache();
            
            // Check whether we need to wait for promises that are already executing
            var open = [];
            var waitForIds = [];
            var waitForPromises = [];
            
            _(uniq).each(function(id) {
                var idStr = self.getIdStr(id);

                var data = resultCache.getItem(idStr);
                if(!data) {
                    
                    var promise = executionCache[idStr];
                    if(promise) {
                        waitForIds.push(id);

                        var found = _(waitForPromises).find(function(p) {
                            var r = (p == promise);
                            return r;
                        });

                        if(!found) {
                            waitForPromises.push(promise);
                        }
                    }
                    else {
                        open.push(id);
                        waitForIds.push(id);
                    }
                } else {
                    resultMap.put(id, data);
                }
            });
            
            
            if(open.length > 0) {
                var p = this.fetchAndCache(open);
                waitForPromises.push(p);
            }
            
            var result = jQuery.when.apply(window, waitForPromises).pipe(function() {
                var maps = arguments;
                _(waitForIds).each(function(id) {
                    
                    var data = null;
                    _(maps).find(function(map) {
                        data = map.get(id);
                        return !!data;
                    });
                    
                    if(data) {
                        resultMap.put(id, data);
                    }
                });
                
                return resultMap;
            });
            
            return result;
        },
        
        /**
         * Function for actually retrieving data from the underlying service and updating caches as needed.
         *
         * Don't call this method directly; it may corrupt caches!
         */
        fetchAndCache: function(ids) {
            var resultCache = this.requestCache.getResultCache();            
            var executionCache = this.requestCache.getExecutionCache();

            var self = this;
            
            var p = this.delegate.lookup(ids);
            var result = p.pipe(function(map) {
                
                var r = new util.HashMap();

                _(ids).each(function(id) {
                    //var id = self.getIdFromDoc(doc);
                    var idStr = self.getIdStr(id);
                    var doc = map.get(id);
                    resultCache.setItem(idStr, doc);
                    r.put(id, doc);
                });

                _(ids).each(function(id) {
                    var idStr = self.getIdStr(id);
                    delete executionCache[idStr];
                });
                
                return r;
            });

            _(ids).each(function(id) {
                var idStr = self.getIdStr(id);
                executionCache[idStr] = result;
            });
            
            return result;
        }
        
    });


    ns.LookupServiceChunker = Class.create(ns.LookupServiceDelegateBase, {
        initialize: function($super, delegate, maxChunkSize) {
            //this.delegate = delegate;
            $super(delegate);
            this.maxChunkSize = maxChunkSize;
        },
        
        lookup: function(keys) {
            var self = this;

            // Make ids unique
            var ks = _(keys).uniq(false, function(key) {
                var keyStr = self.getIdStr(key);
                return keyStr;
            });
            
            var chunks = util.ArrayUtils.chunk(ks, this.maxChunkSize);

            var promises = _(chunks).map(function(chunk) {
                var r = self.delegate.lookup(chunk);
                return r;
            });
            
            var result = jQuery.when.apply(window, promises).pipe(function() {
                var r = new util.HashMap();
                _(arguments).each(function(map) {
                    r.putAll(map);
                });
                
                return r;
            });
            
            return result;
        }
    });
    
    /**
     * Wrapper that collects ids for a certain amount of time before passing it on to the
     * underlying lookup service.
     */
    ns.LookupServiceTimeout = Class.create(ns.LookupServiceDelegateBase, {
        
        initialize: function($super, delegate, delayInMs, maxRefreshCount) {
            //this.delegate = delegate;
            $super(delegate);

            this.delayInMs = delayInMs;
            this.maxRefreshCount = maxRefreshCount || 0;
            
            this.idStrToId = {};
            this.currentDeferred = null;
            this.currentPromise = null;
            this.currentTimer = null;            
            this.currentRefreshCount = 0;
        },
        
        getIdStr: function(id) {
            var result = this.delegate.getIdStr(id);
            return result;
        },
        
        lookup: function(ids) {
            if(!this.currentDeferred) {
                this.currentDeferred = jQuery.Deferred();
                this.currentPromise = this.currentDeferred.promise();
            }

            var self = this;
            _(ids).each(function(id) {
                var idStr = self.getIdStr(id);
                var val = self.idStrToId[idStr];
                if(!val) {
                    self.idStrToId[idStr] = id;
                }
            });
            
            if(!this.currentTimer) {
                this.startTimer();
            }

            // Filter the result by the ids which we requested
            var result = this.currentPromise.pipe(function(map) {
                var r = new util.HashMap();
                _(ids).each(function(id) {
                    var val = map.get(id);
                    r.put(id, val);
                });
                return r;
            });
            
            
            return result;
        },
        
        startTimer: function() {

            var self = this;
            var seenRefereshCount = this.currentRefreshCount;
            var deferred = self.currentDeferred;
            
            this.currentTimer = setTimeout(function() {
                
                if(self.maxRefreshCount < 0 || seenRefereshCount < self.maxRefreshCount) {
                    //clearTimeout(this.currentTimer);
                    ++self.currentRefreshCount;
                    self.startTimer();
                    return;
                }
                
                var ids = _(self.idStrToId).values();
                
                self.idStrToId = {};
                self.currentRefreshCount = 0;
                self.currentDeferred = null;
                self.currentTimer = null;

                var p = self.delegate.lookup(ids);
                p.pipe(function(map) {
                    deferred.resolve(map);
                }).fail(function() {
                    deferred.fail();
                });
                
            }, this.delayInMs);
        }

        // TODO Rather than refresing for the whole time interval, we could
        // refresh upon every change (up to a maximum delay time)
        /*
        var self = this;
        var isModified = false;
        _(ids).each(function(id) {
            var idStr = self.delegate.getIdStr(id);
            var val = self.idStrToId[idStr];
            if(!val) {
                idStrToId[idStr] = id;
                isModified = true;
            }
        });

        if(!isModified) {
            return result;
        }
        */

    });

    

    
    ns.LookupServiceSponate = Class.create(ns.LookupServiceBase, {
        initialize: function(source) {
            // Note: By source we mean e.g. store.labels
            this.source = source;
        },
        
        lookup: function(nodes) {
            var result = this.source.find().nodes(nodes).asList(true).pipe(function(docs) {
                var r = new util.HashMap();
                _(docs).each(function(doc) {
                    r.put(doc.id, doc);
                });
                return r;
            });

            return result;
        }
    });


    // In-place transform the values for the looked up documents
    ns.LookupServiceTransform = Class.create(ns.LookupServiceDelegateBase, {
        initialize: function($super, delegate, fnTransform) {
            $super(delegate);
            this.fnTransform = fnTransform;
        },
                
        lookup: function(ids) {
            var fnTransform = this.fnTransform;

            var result = this.delegate.lookup(ids).pipe(function(map) {
                
                _(ids).each(function(id) {
                    var val = map.get(id);
                    var t = fnTransform(val, id);
                    map.put(id, t);
                });
                
                return map;
            });
            
            return result;
        }
    });
    
    
    ns.LookupServicePathLabels = Class.create(ns.LookupServiceBase, {
        initialize: function(lookupServiceBase) {
            this.lookupServiceBase = lookupServiceBase;
        },
        
        lookup: function(paths) {
            var nodes = _(paths).chain()
                // Get all unique mentioned property names and turn them to jassa nodes
                .map(function(path) {
                    var r = _(path.getSteps()).map(function(step) {
                        return step.getPropertyName();
                    });
                    return r;
                })
                .flatten()
                .uniq()
                .map(function(propertyName) {
                    return rdf.NodeFactory.createUri(propertyName);
                })
                .value();

            // Do a lookup with all the nodes
            var result = this.lookupServiceBase.lookup(nodes).pipe(function(map) {
                var r = new util.HashMap();
                _(paths).each(function(path) {
                    var label = _(path.getSteps()).reduce(function(memo, step) {
                        var result = memo;
                        
                        var property = rdf.NodeFactory.createUri(step.getPropertyName());
                        var label = map.get(property);
                        
                        result = result === '' ? result : result + ' ';
                        result += label;
                        result = !step.isInverse() ? result : result + '&sup1';

                        return result;
                    }, '');
                    
                    if(label === '') {
                        label = 'Items';
                    }
                    
                    r.put(path, label);
                    /*
                    r.put(path, {
                        id: path,
                        displayLabel: label);
                    });
                    */
                });
                
                return r;
            });

            return result;
        }
    });
    
    /**
     * Lookup Service which can filter keys. Used to e.g. get rid of invalid URIs which would
     * cause SPARQL queries to fail
     */
    ns.LookupServiceIdFilter = Class.create(ns.LookupServiceDelegateBase, {
        initialize: function($super, delegate, predicateFn) {
            $super(delegate);
            this.predicateFn = predicateFn;
        },
        
        lookup: function(keys) {
            var newKeys = _(keys).filter(this.predicateFn);
            var result = this.delegate.lookup(newKeys);
            return result;
        }
    });
    
    ns.LookupServiceConstraintLabels = Class.create(ns.LookupServiceBase, {
        initialize: function(lookupServiceNodeLabels, lookupServicePathLabels) {
            this.lookupServiceNodeLabels = lookupServiceNodeLabels;
            this.lookupServicePathLabels = lookupServicePathLabels || new ns.LookupServicePathLabels(lookupServiceNodeLabels);
        },
        
        lookup: function(constraints) {
            // Note: For now we just assume subclasses of ConstraintBasePathValue
        
            var paths = [];
            var nodes = [];
            
            _(constraints).each(function(constraint) {
                var cPaths = constraint.getDeclaredPaths();
                var cNode = constraint.getValue();
                
                paths.push.apply(paths, cPaths);
                nodes.push(cNode);
            });

            var p1 = this.lookupServiceNodeLabels.lookup(nodes);
            var p2 = this.lookupServicePathLabels.lookup(paths);
        
            var result = jQuery.when.apply(window, [p1, p2]).pipe(function(nodeMap, pathMap) {
                var r = new util.HashMap();

                _(constraints).each(function(constraint) {
                    var cPath = constraint.getDeclaredPath();
                    var cNode = constraint.getValue();

                    var pathLabel = pathMap.get(cPath);
                    var nodeLabel = nodeMap.get(cNode);
                    
                    var cLabel = pathLabel + ' = ' + nodeLabel;
                    r.put(constraint, cLabel);
                });
                
                return r;
            });
            
            return result;
        }
    });
    
})();