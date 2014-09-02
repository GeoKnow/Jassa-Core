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


var ExecutionContext = Class.create({
    initialize: function() {
        this.mappingToKeyToAcc = {};
    },

//    getOrCreateEntry: function(mappingName) {
//        this.mappingToKeyToAcc
//    }
});


var indexAccMap = function(state, sourceName, nodeToAcc) {
    var map = state[sourceName];
    if(!map) {
        map = new HashMap();
        state[sourceName] = map;
    }

    map.putAll(nodeToAcc);
    /*
    accEntries.forEach(function(accEntry) {
        var id = accEntry.key;
        var acc = accEntry.val;

        map.put(id, acc);
    });
    */
};


var mergeRefs = function(open, refs) {
    refs.forEach(function(ref) {
        var refSpec = ref.getRefSpec();
        var sourceName = refSpec.getTargetSourceName();
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
        var sourceName = refSpec.getTargetSourceName();
        var refValue = ref.getRefValue();

        var map = state[sourceName];

        var isResolved = map.containsKey(refValue);
        if(!isResolved) {
            result.push(ref);
        }
    });

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

        var result = listServiceAcc.fetchItems(filterConcept, limit, offset).then(function(accEntries) {
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

                //console.log('Item: ', item);
                //var id = item.key;
                //var acc = item.val;
                //map.put(id, acc);

                var refs = AccUtils.getRefs(acc);

                mergeRefs(open, refs);
            });

            //console.log('OPEN: ' + JSON.stringify(open, null, 4));

            state[sourceName] = map;
            var p = self.resolveRefs(decls, open, state);
            return [rootIds, p];

        }).spread(function(rootIds, p) {

            // console.log('STATE: ' + Object.keys(state));
            //console.log('STATE: ' + JSON.stringify(state, null, 4));

            // Allocate objects for all acc-structures
            var objs = {};

            forEach(state, function(srcMap, sourceName) {
                //console.log('SOURCE NAME: ' + sourceName);
                var objMap = new HashMap();
                objs[sourceName] = objMap;

                srcMap.entries().forEach(function(entry) {
                    var id = entry.key;
                    objMap.put(id, {});
                });
            });


            // Fill out AccRef instances with the object
            var accRefs = [];
            forEach(state, function(srcMap) {
                var accs = srcMap.values();
                var refs = AccUtils.getRefs(accs);

                accRefs.push.apply(accRefs, refs);
            });


            //console.log('accRefs: ' + JSON.stringify(accRefs));
            accRefs.forEach(function(accRef) {
                var refSpec = accRef.getRefSpec();
                var sourceName = refSpec.getTargetSourceName();
                var refValue = accRef.getRefValue();

                var idToObj = objs[sourceName];
                if(!idToObj) {
                    throw new Error('Something went wrong');
                }

                var obj = idToObj.get(refValue);
                accRef.setValue(obj);
            });

            // Retrieve the value of each acc and extend the original object with it
            forEach(state, function(srcMap, sourceName) {
                srcMap.entries().forEach(function(entry) {
                    var id = entry.key;
                    var acc = entry.val;

                    var val = acc.getValue();

                    var idToObj = objs[sourceName];

                    var obj = idToObj.get(id);
                    //console.log('EXTEND: ' + JSON.stringify(obj) + ' with ' + JSON.stringify(val));
                    ObjectUtils.extend(obj, val);
                });
            });
            // console.log('Retrieved: ' + JSON.stringify(objs, null, 4));

            // Prepare the result
            var r = rootIds.map(function(rootId) {
                var idToObj = objs[sourceName];
                var obj = idToObj.get(rootId);

                var s = {
                    key: rootId,
                    val: obj
                };

                return s;
            });

            // console.log('RESULT ' + JSON.stringify(r, null, 4));
            // console.log('RESULT ' + JSON.stringify(r, null, 4));

            return r;
        });


        //var result = this.execRec(decl, open, {});
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

                //console.log('RESOLVED: ' + JSON.stringify(state, null, 4));
                //console.log('NEXT: ' + JSON.stringify(next, null, 4));
                //console.log('XST: ' + Object.keys(state));

                return self.resolveRefs(decls, next, state);
                //return null;
            });

            return subPromise;
        });

        return Promise.all(subPromises);
    }),

});

module.exports = Engine;
