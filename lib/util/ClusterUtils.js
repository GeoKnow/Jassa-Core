
var ClusterUtils = {

    indexPredicates: function(predicate, keyToGroup, predicateToGroupKey, source) {
        var p = predicate.id.getUri();

        var groupKey = predicateToGroupKey[p];
        if(!groupKey) {
            groupKey = p;
        }

        var group = keyToGroup[groupKey];
        if(!group) {
            group = {
                id: groupKey,
                valueToMember: {}
            };
            keyToGroup[groupKey] = group;
        }

        var valueToMember = group.valueToMember;

        predicate.values.forEach(function(o) {
            var str = o.toString();
            var member = valueToMember[str];
            if(!member) {
                member = {
                    predicate: predicate.id,
                    value: o,
                    sources: []
                };

                valueToMember[str] = member;
            }

            var sources = member.sources;
            if(sources.indexOf(source) < 0) {
                sources.push(source);
            }
        });
    },


    /**
     * Utility method to cluster values of predicates for links (pair of resources)
     *
     * link: {
     *   source: {
     *     predicates: [{
     *       id: 'http://predi.ca/te'
     *       values: [{
     *           id: 'http://foobar'
     *       }]
     *     ]
     *   },
     *   target: (analogous to source)
     * }
     *
     * @param link
     * @param predicateToGroupKey
     * @param keyToGroup
     *
     */
    clusterLink: function(link, predicateToGroupKey, keyToGroup) {
        keyToGroup = keyToGroup || {};

        // Collect the union of properties in source and target position
        link.source.predicates.forEach(function(p) { ClusterUtils.indexPredicates(p, keyToGroup, predicateToGroupKey, 'source'); });
        link.target.predicates.forEach(function(p) { ClusterUtils.indexPredicates(p, keyToGroup, predicateToGroupKey, 'target'); });

        //console.log(keyToGroup);
        return keyToGroup;
    }

};

module.exports = ClusterUtils;
