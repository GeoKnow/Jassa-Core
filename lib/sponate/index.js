'use strict';

var ns = {
    AttrPath: require('./AttrPath'),
    MapList: require('./MapList'),
    PatternParser: require('./PatternParser'),
    SponateContext: require('./SponateContext'),
    SponateQuery: require('./SponateQuery'),
    SponateUtils: require('./SponateUtils'),
    Acc: require('./accumulator/Acc'),
    AccCustomAcc: require('./accumulator/AccCustomAcc'),
    AccLiteral: require('./accumulator/AccLiteral'),
    AccMap: require('./accumulator/AccMap'),
    AccObject: require('./accumulator/AccObject'),
    AccRef: require('./accumulator/AccRef'),
    Agg: require('./aggregator/Agg'),
    AggBase: require('./aggregator/AggBase'),
    AggCustomAgg: require('./aggregator/AggCustomAgg'),
    AggLiteral: require('./aggregator/AggLiteral'),
    AggMap: require('./aggregator/AggMap'),
    AggObject: require('./aggregator/AggObject'),
    AggRef: require('./aggregator/AggRef'),
    MappingRef: require('./aggregator/MappingRef'),
    PatternUtils: require('./aggregator/PatternUtils'),
    RefSpec: require('./aggregator/RefSpec'),
};

Object.freeze(ns);

module.exports = ns;
