'use strict';

var ns = {
    ArrayUtils: require('./ArrayUtils'),
    ExceptionUtils: require('./ExceptionUtils'),
    CacheUtils: require('./CacheUtils'),
    ClusterUtils: require('./ClusterUtils'),
    CollectionUtils: require('./CollectionUtils'),
    JsonUtils: require('./JsonUtils'),
    MapUtils: require('./MapUtils'),
    ObjectUtils: require('./ObjectUtils'),
    PrefixUtils: require('./PrefixUtils'),
    PromiseUtils: require('./PromiseUtils'),
    SerializationContext: require('./SerializationContext'),
    Serializer: require('./Serializer'),
    SetUtils: require('./SetUtils'),
    StringUtils: require('./StringUtils'),
    TreeUtils: require('./TreeUtils'),
    UriUtils: require('./UriUtils'),
    shared: require('./shared'),
    ArrayList: require('./collection/ArrayList'),
    Entry: require('./collection/Entry'),
    HashBidiMap: require('./collection/HashBidiMap'),
    HashMap: require('./collection/HashMap'),
    HashSet: require('./collection/HashSet'),
    Iterator: require('./collection/Iterator'),
    IteratorAbstract: require('./collection/IteratorAbstract'),
    IteratorArray: require('./collection/IteratorArray'),
    ListMap: require('./collection/ListMap'),
    MapUnion: require('./collection/MapUnion'),
    MultiMapObjectArray: require('./collection/MultiMapObjectArray'),
};

//Object.freeze(ns);

module.exports = ns;

