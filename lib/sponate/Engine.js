var Class = require('../ext/Class');

var ListServiceUtils = require('./ListServiceUtils');
var AccUtils = require('./AccUtils');

var HashMap = require('../util/collection/HashMap');
var HashSet = require('../util/collection/HashSet');

var LookupServiceUtils =  require('./LookupServiceUtils');
var ListServiceUtils =  require('./ListServiceUtils');

var ObjectUtils = require('../util/ObjectUtils');

//var _ = require('lodash');
var forEach = require('lodash.foreach');

var shared = require('../util/shared');
var Promise = shared.Promise;


var indexAccMap = function(state, sourceName, nodeToAcc) {
    var map = state[sourceName];
    if(!map) {
        map = new HashMap();
        state[sourceName] = map;
    }

    map.putAll(nodeToAcc);
};


var Slot = Class.create({
    initialize: function(obj, attr, meta) {
        this.obj = obj;
        this.attr = attr;

        this.meta = meta;
    },

    setValue: function(value) {
        this.obj[this.attr] = value;
    },

    getValue: function() {
        return this.obj[this.attr];
    },

    getMeta: function() {
        return this.data;
    },

    toString: function() {
        return JSON.stringify(this);
    }
});


var mergeRefs = function(open, refs) {
    refs.forEach(function(ref) {
        var refSpec = ref.getRefSpec();
        var sourceName = refSpec.getTarget();
        var refValue = ref.getRefValue();

        var set;
        if(!(sourceName in open)) {
            set = new HashSet();
            open[sourceName] = set;
        } else {
            set = open[sourceName];
        }

        set.add(refValue);
    });
};

// Return a new array of refs that are not already covered by the state
// i.e. only return those refs which still need to be resolved
var filterRefs = function(state, refs) {
    var result = [];

    refs.forEach(function(ref) {
        var refSpec = ref.getRefSpec();
        var sourceName = refSpec.getTarget();
        var refValue = ref.getRefValue();

        var map = state[sourceName];

        var isResolved = map && map.containsKey(refValue);
        if(!isResolved) {
            result.push(ref);
        }
    });

    return result;
};

var buildObjs = function(state) {
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
};


var buildSlots = function(obj, result) {
    result = result || [];

    if(Array.isArray(obj)) {

        obj.forEach(function(item) {
            buildSlots(item, result);
        });

    } else if(ObjectUtils.isObject(obj)) {

        forEach(obj, function(v, k) {
            if(v && v._ref) {
                var slot = new Slot(obj, k, v._ref);
                result.push(slot);
            } else {
                buildSlots(v, result);
            }
        });

    } /* else {
        // Nothing to do
    } */

    return result;
};


var Engine = Class.create({
    initialize: function(sparqlService) {
        this.sparqlService = sparqlService;
    },

    execList: function() {

    },

    execMap: function() {

    },

    createLookupService: function(decls, sourceName) {
        var source = decls.getSource(sourceName);
        if(!source) {
            throw new Error('No source mapping with name ' + sourceName + ' found');
        }

        var sparqlService = source.getSparqlService();
        var mappedConcept = source.getMappedConcept();
        var result = LookupServiceUtils.createLookupServiceMappedConceptAcc(sparqlService, mappedConcept);
        return result;
    },

/*
    createListService: function(decls, sourceName) {
        var source = decls.getSource(sourceName);
        if(!source) {
            throw new Error('No source mapping with name ' + sourceName + ' found');
        }

        var sparqlService = source.getSparqlService();
        var mappedConcept = source.getMappedConcept();
        var result = LookupServiceUtils.createLookupServiceAcc(sparqlService, mappedConcept);
        return result;
    },
*/
    exec: function(decls, query) {

        var sourceName = query.getSourceName();

        var source = decls.getSource(sourceName);
        if(!source) {
            throw new Error('No source mapping with name ' + sourceName + ' found');
        }

        var limit = query.getLimit();
        var offset = query.getOffset();
        var filterConcept = query.getFilterConcept();

        var sparqlService = source.getSparqlService();
        var mappedConcept = source.getMappedConcept();
        var listServiceAcc = ListServiceUtils.createListServiceAcc(sparqlService, mappedConcept, query.isLeftJoin());

        // Do the initial concept based lookup
        var state = {};

        var self = this;

        var basePromise = listServiceAcc.fetchItems(filterConcept, limit, offset);
        var promise = Promise.resolve(basePromise);

        var result = promise.then(function(accEntries) {
            // Get the initial ids
            var rootIds = accEntries.map(function(accEntry) { // TODO We could use _.pluck here
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

                mergeRefs(open, refs);
            });

            //console.log('OPEN: ' + JSON.stringify(open, null, 4));

            state[sourceName] = map;
            var p = self.resolveRefs(decls, open, state);
            return [rootIds, p];

        }).spread(function(rootIds, p) {

            // Retain all references
            var accRefs = [];
            forEach(state, function(srcMap) {
                var accs = srcMap.values();
                var refs = AccUtils.getRefs(accs);

                accRefs.push.apply(accRefs, refs);
            });

            accRefs.forEach(function(accRef) {
                var refSpec = accRef.getRefSpec();
                var targetName = refSpec.getTarget();
                var refValue = accRef.getRefValue();

                accRef.setBaseValue({
                    _ref: {targetName: targetName, refValue: refValue, attr: refSpec.getAttr() }
                });
            });

            var sourceToIdToObj = buildObjs(state);

            var slots = buildSlots(sourceToIdToObj);

            slots.forEach(function(slot) {
                var meta = slot.meta;

                var idToObj = sourceToIdToObj[meta.targetName];
                var obj = idToObj.get(meta.refValue);

                if(meta.attr) {
                    obj = obj[meta.attr];
                }
                //console.log('SLOT: ' + meta + ' ' + meta.attr + ' ' + obj);

                slot.setValue(obj);
            });

            // Prepare the result
            var r = rootIds.map(function(rootId) {
                var idToObj = sourceToIdToObj[sourceName];
                var obj = idToObj.get(rootId);
                var s = {
                    key: rootId,
                    val: obj
                };
                return s;
            });

            return r;
        });

        return result;

    },

    /**
     * open is a Map<SourceName, Set<ObjectId>>
     * state is a Map<SourceName, Map<ObjectId, Document>>
     */
    resolveRefs: Promise.method(function(decls, open, state) {

        var self = this;
        var sourceNames = Object.keys(open);

        //console.log('SOURCE NAMES: ', sourceNames);

        var subPromises = sourceNames.map(function(sourceName) {

            //console.log('XXXNAMES: ' + sourceName);

            var set = open[sourceName];

            var lookupService = self.createLookupService(decls, sourceName);
            var nodes = set.entries();


            var subPromise = lookupService.lookup(nodes).then(function(nodeToAcc) {
                var accs = nodeToAcc.values();
                //console.log('accs: ' + JSON.stringify(accs));
                //if(true) { throw new Error('foo'); }

                indexAccMap(state, sourceName, nodeToAcc);
                var refs = AccUtils.getRefs(accs);
                var openRefs = filterRefs(state, refs);
                var next = {};
                mergeRefs(next, openRefs);

                return self.resolveRefs(decls, next, state);
            });

            return subPromise;
        });

        return Promise.all(subPromises);
    }),

});

module.exports = Engine;
