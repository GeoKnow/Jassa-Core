var Class = require('../../ext/Class');
var ListService = require('./ListService');
var ServiceUtils = require('../ServiceUtils');
var shared = require('../../util/shared');
var Promise = shared.Promise;
var ConceptUtils = require('../sparql/ConceptUtils');

/**
 *
 *
 */
ListServiceConceptKeyLookup = Class.create(ListService, {
    initialize: function(sparqlService, keyLookupService) {
        this.sparqlService = sparqlService;
        this.keyLookupService = keyLookupService;
    },

    fetchItems: Promise.method(function(concept, limit, offset) {
        var query = ConceptUtils.createQueryList(concept, limit, offset);

        var self = this;
        var result = ServiceUtils
            .fetchList(query, concept.getVar())
            .then(function(items) {
                return self.keyLookupService.lookup(items);
            })
            .then(function(map) {
                return map;
            });

        return result;
    }),

    fetchCount: function(concept, threshold) {
        var result = ns.ServiceUtils.fetchCountConcept(concept, threshold);
        return result;
    }
});

module.exports = ListServiceConceptKeyLookup;



ns.ListServiceConceptKeyLookup = Class.create(ns.ListService, {
    // initialize: function(conceptLookupService, keyLookupService) {
    initialize: function(keyListService, keyLookupService, isLeftJoin) {
        this.keyListService = keyListService;
        this.keyLookupService = keyLookupService;
        this.isLeftJoin = isLeftJoin == null ? true : isLeftJoin;
    },
    
    fetchItems: function(concept, limit, offset) {
        var deferred = jQuery.Deferred();
        
        var self = this; 
        
        var promise = this.keyListService.fetchItems(concept, limit, offset);            
        promise.pipe(function(keys) {
            
            self.keyLookupService.lookup(keys).pipe(function(map) {

                //deferred.resolve(map);

                var entries = map.entries();
                var r = _(entries).values();
                deferred.resolve(r);

            }).fail(function() {
                deferred.reject();
            });
        }).fail(function() {
            deferred.reject();
        });
        
        return deferred.promise();
    },
    
    fetchCount: function(concept, itemLimit, rowLimit) {
        var result;
        if(this.isLeftJoin) {
            result = this.keyListService.fetchCount(concept, itemLimit, rowLimit);
        } else {
            var self = this;
            var deferred = jQuery.Deferred();

            var p = this.keyListService.fetchItems(concept, itemLimit);
            p.pipe(function(items) {
                var p2 = self.keyLookupService.lookup(items);
                p2.pipe(function(map) {
                    var keyList = map.keyList();
                    var count = keyList.length;
                    var r = {
                        count: count,
                        hasMoreItems: itemLimit == null ? false : null // absence of a value indicates 'unknown'
                    };
                    deferred.resolve(r);
                }).fail(function() {
                    deferred.reject();
                });
            }).fail(function() {
                deferred.reject();
            });
            
            result = deferred.promise();
        }
        
        return result;
    }
});