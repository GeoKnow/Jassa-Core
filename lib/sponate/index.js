'use strict';

var ns = {
    AttrPath: require('./AttrPath'),
    MapList: require('./MapList'),
    PatternParser: require('./PatternParser'),
    SponateContext: require('./SponateContext'),
    SponateQuery: require('./SponateQuery'),
    SponateUtils: require('./SponateUtils'),
    Accumulator: require('./accumulator/Accumulator'),
    AccumulatorCustomAcc: require('./accumulator/AccumulatorCustomAcc'),
    AccumulatorLiteral: require('./accumulator/AccumulatorLiteral'),
    AccumulatorMap: require('./accumulator/AccumulatorMap'),
    AccumulatorObject: require('./accumulator/AccumulatorObject'),
    AccumulatorRef: require('./accumulator/AccumulatorRef'),
    Aggregator: require('./aggregator/Aggregator'),
    AggregatorBase: require('./aggregator/AggregatorBase'),
    AggregatorCustomAgg: require('./aggregator/AggregatorCustomAgg'),
    AggregatorLiteral: require('./aggregator/AggregatorLiteral'),
    AggregatorMap: require('./aggregator/AggregatorMap'),
    AggregatorObject: require('./aggregator/AggregatorObject'),
    AggregatorRef: require('./aggregator/AggregatorRef'),
    MappingRef: require('./aggregator/MappingRef'),
    PatternUtils: require('./aggregator/PatternUtils'),
    RefSpec: require('./aggregator/RefSpec'),
};

Object.freeze(ns);

module.exports = ns;
