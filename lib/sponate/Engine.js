var Class = require('../ext/Class');

var ListServiceUtils = require('./ListServiceUtils');
var AccUtils = require('./AccUtils');

var HashMap = require('../util/collection/HashMap');
var HashSet = require('../util/collection/HashSet');

var LookupServiceUtils = require('./LookupServiceUtils');
var ListServiceUtils = require('./ListServiceUtils');

var ListServiceTransformItems = require('../service/list_service/ListServiceTransformItems');

var ObjectUtils = require('../util/ObjectUtils');

// var _ = require('lodash');
var forEach = require('lodash.foreach');

var shared = require('../util/shared');
var Promise = shared.Promise;

var Slot = Class.create({
    initialize : function(obj, attr, meta) {
        this.obj = obj;
        this.attr = attr;

        this.meta = meta;
    },

    setValue : function(value) {
        this.obj[this.attr] = value;
    },

    getValue : function() {
        return this.obj[this.attr];
    },

    getMeta : function() {
        return this.meta;
    },

    toString : function() {
        return JSON.stringify(this);
    }
});

var Engine = {
    indexAccMap : function(state, sourceName, nodeToAcc) {
        var map = state[sourceName];
        if (!map) {
            map = new HashMap();
            state[sourceName] = map;
        }

        map.putAll(nodeToAcc);
    },

    mergeRefs : function(open, refs) {
        refs.forEach(function(ref) {
            var refSpec = ref.getRefSpec();
            var sourceName = refSpec.getTarget();
            var refValue = ref.getRefValue();

            var set;
            if (!(sourceName in open)) {
                set = new HashSet();
                open[sourceName] = set;
            } else {
                set = open[sourceName];
            }

            set.add(refValue);
        });
    },

    // Return a new array of refs that are not already covered by the state
    // i.e. only return those refs which still need to be resolved
    filterRefs : function(state, refs) {
        var result = [];

        refs.forEach(function(ref) {
            var refSpec = ref.getRefSpec();
            var sourceName = refSpec.getTarget();
            var refValue = ref.getRefValue();

            var map = state[sourceName];

            var isResolved = map && map.containsKey(refValue);
            if (!isResolved) {
                result.push(ref);
            }
        });

        return result;
    },

    buildObjs : function(state) {
        var result = {};

        // Retrieve the value of each acc and extend the original object with it
        // At this point we do not resolve references yet
        forEach(state, function(srcMap, sourceName) {

            var objMap = new HashMap();
            result[sourceName] = objMap;

            srcMap.entries().forEach(function(entry) {
                var id = entry.key;
                var acc = entry.val;

                var val = acc.getValue();
                objMap.put(id, val);
            });
        });

        return result;
    },

    /**
     * For each object retrieve its lazy slots and reverse the order, so that
     * we can evaluate the lazy functions in a depth first manner (i.e. parent lazy transform
     * will only be executed after the child transforms have been applied)
     */
    buildLazySlots: function(sourceToIdtoObj, attr, result) {
        result = result || [];

        forEach(sourceToIdtoObj, function(srcMap, sourceName) {
            srcMap.values().forEach(function(obj) {
                var tmp = Engine.buildSlots(obj, attr);
                tmp = tmp.reverse();
                result.push.apply(result, tmp);
            });
        });

        return result;
    },

    buildSlots : function(obj, attr, result) {
        result = result || [];

        if (Array.isArray(obj)) {

            obj.forEach(function(item, index) {
                if(item && item[attr]) {
                    var slot = new Slot(obj, index, item[attr]);
                    result.push(slot);
                } else {
                    Engine.buildSlots(item, attr, result);
                }
            });

        } else if (ObjectUtils.isObject(obj)) {

            forEach(obj, function(v, k) {
                if (v && v[attr]) {
                    var slot = new Slot(obj, k, v[attr]);
                    result.push(slot);
                } else {
                    Engine.buildSlots(v, attr, result);
                }
            });

        } /*
             * else { // Nothing to do }
             */

        return result;
    },

    createLookupService : function(decls, sourceName) {
        var source = decls.getSource(sourceName);
        if (!source) {
            throw new Error('No source mapping with name ' + sourceName
                    + ' found');
        }

        var sparqlService = source.getSparqlService();
        var mappedConcept = source.getMappedConcept();
        var result = LookupServiceUtils.createLookupServiceMappedConceptAcc(
                sparqlService, mappedConcept);
        return result;
    },

    createListService : function(decls, sourceName, isLeftJoin) {

        // var sourceName = query.getSourceName();

        var source = decls.getSource(sourceName);
        if (!source) {
            throw new Error('No source mapping with name ' + sourceName
                    + ' found');
        }

        var sparqlService = source.getSparqlService();
        var mappedConcept = source.getMappedConcept();
        var listServiceAcc = ListServiceUtils.createListServiceAcc(
                sparqlService, mappedConcept, isLeftJoin);

        var self = this;

        var result = new ListServiceTransformItems(listServiceAcc, function(
                accEntries) {
            var basePromise = self.collectState(decls, sourceName, accEntries);
            return Promise.resolve(basePromise).spread(
                    function(rootIds, state, p) {
                        var r = self.postProcess(state, sourceName, rootIds);
                        return r;
                    });
        });

        return result;
    },

    collectState : function(decls, sourceName, accEntries) {
        // Do the initial concept based lookup
        var state = {};

        // Get the initial ids
        var rootIds = accEntries.map(function(accEntry) { // TODO We could use
                                                            // _.pluck here
            return accEntry.key;
        });

        // Collect the accs
        var map = new HashMap();
        var open = {};

        accEntries.forEach(function(accEntry) {
            var acc = accEntry.val;

            // Note: We expect instances of AccMap here!
            var state = acc.getState();

            map.putAll(state);

            var refs = AccUtils.getRefs(acc);

            Engine.mergeRefs(open, refs);
        });

        // console.log('OPEN: ' + JSON.stringify(open, null, 4));

        state[sourceName] = map;
        var p = this.resolveRefs(decls, open, state);
        return [ rootIds, state, p ];
    },

    postProcess : function(state, sourceName, rootIds) {

        // Retain all references
        var accRefs = [];
        forEach(state, function(srcMap) {
            var accs = srcMap.values();
            var refs = AccUtils.getRefs(accs);

            accRefs.push.apply(accRefs, refs);
        });

        //console.log('AccRefs: ', accRefs);

        accRefs.forEach(function(accRef) {
            var refSpec = accRef.getRefSpec();
            var targetName = refSpec.getTarget();
            var refValue = accRef.getRefValue();

            accRef.setBaseValue({
                _ref : {
                    targetName : targetName,
                    refValue : refValue,
                    attr : refSpec.getAttr()
                }
            });
        });

        var sourceToIdToObj = Engine.buildObjs(state);

        //try {
        var refSlots = Engine.buildSlots(sourceToIdToObj, '_ref');

        var lazySlots = Engine.buildLazySlots(sourceToIdToObj, '_lazy');

//        } catch(err) {
//            console.log('err: ', err);
//        }
        //console.log('Got ' + slots.length + ' slots');

        refSlots.forEach(function(slot) {
            var meta = slot.getMeta();

            var idToObj = sourceToIdToObj[meta.targetName];
            var obj = idToObj.get(meta.refValue);

            var attr = meta.attr;
            obj = (obj != null && attr != null) ? obj[attr] : obj;

            //console.log('SLOT: ' + meta + ' ' + meta.attr + ' ' + obj);

            slot.setValue(obj);
        });


        lazySlots.forEach(function(slot) {
            var meta = slot.getMeta();

            var fn = meta.fn;
            var v = meta.value;

            var replacement = fn(v);
            slot.setValue(replacement);
        });

        // Apply lazy functions
       //var slots = Engine.buildSlots(sourceToIdToObj, '_lazy');

        // Prepare the result
        var result = rootIds.map(function(rootId) {
            var idToObj = sourceToIdToObj[sourceName];
            var obj = idToObj.get(rootId);
            var r = {
                key : rootId,
                val : obj
            };
            return r;
        });

        return result;
    },

    exec : function(decls, query) {
        var sourceName = query.getSourceName();
        var listService = this.createListService(decls, sourceName, query
                .isLeftJoin());

        var limit = query.getLimit();
        var offset = query.getOffset();
        var filterConcept = query.getFilterConcept();

        var result = listService.fetchItems(filterConcept, limit, offset);

        return result;
    },

    /**
     * open is a Map<SourceName, Set<ObjectId>> state is a Map<SourceName,
     * Map<ObjectId, Document>>
     */
    resolveRefs : Promise.method(function(decls, open, state) {

        var self = this;
        var sourceNames = Object.keys(open);

        // console.log('SOURCE NAMES: ', sourceNames);

        var subPromises = sourceNames.map(function(sourceName) {

            // console.log('XXXNAMES: ' + sourceName);

            var set = open[sourceName];

            var lookupService = self.createLookupService(decls, sourceName);
            var nodes = set.entries();

            var subPromise = lookupService.lookup(nodes).then(
                    function(nodeToAcc) {
                        var accs = nodeToAcc.values();
                        // console.log('accs: ' + JSON.stringify(accs));
                        // if(true) { throw new Error('foo'); }

                        Engine.indexAccMap(state, sourceName, nodeToAcc);
                        var refs = AccUtils.getRefs(accs);
                        var openRefs = Engine.filterRefs(state, refs);
                        var next = {};
                        Engine.mergeRefs(next, openRefs);

                        return self.resolveRefs(decls, next, state);
                    });

            return subPromise;
        });

        return Promise.all(subPromises);
    }),

};

module.exports = Engine;
