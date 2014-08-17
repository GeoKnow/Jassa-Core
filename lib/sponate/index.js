'use strict';

var ns = {
    AccUtils: require('./AccUtils'),
    AttrPath: require('./AttrPath'),
    BestLiteralConfig: require('./BestLiteralConfig'),
    Context: require('./Context'),
    LookupServiceSponate: require('./LookupServiceSponate'),
    MapList: require('./MapList'),
    MappingRef: require('./MappingRef'),
    PatternParser: require('./PatternParser'),
    Query: require('./Query'),
    RefSpec: require('./RefSpec'),
    SponateUtils: require('./SponateUtils'),
    Acc: require('./acc/Acc'),
    AccArray: require('./acc/AccArray'),
    AccBestLiteral: require('./acc/AccBestLiteral'),
    AccFn: require('./acc/AccFn'),
    AccMap: require('./acc/AccMap'),
    AccObject: require('./acc/AccObject'),
    AccRef: require('./acc/AccRef'),
    AccTransform: require('./acc/AccTransform'),
    Agg: require('./agg/Agg'),
    AggArray: require('./agg/AggArray'),
    AggBestLiteral: require('./agg/AggBestLiteral'),
    AggCustomAcc: require('./agg/AggCustomAcc'),
    AggExpr: require('./agg/AggExpr'),
    AggMap: require('./agg/AggMap'),
    AggObject: require('./agg/AggObject'),
    AggRef: require('./agg/AggRef'),
    AggTransform: require('./agg/AggTransform'),
    BindingMapper: require('./agg/BindingMapper'),
};

Object.freeze(ns);

module.exports = ns;
