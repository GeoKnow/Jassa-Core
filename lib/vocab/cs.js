var NodeFactory = require('../rdf/NodeFactory');
var p = 'http://purl.org/vocab/changeset/schema#';

var ns = {
    ChangeSet: NodeFactory.createUri(p + 'ChangeSet'),

    addition: NodeFactory.createUri(p + 'addition'),
    changeReason: NodeFactory.createUri(p + 'changeReason'),
    createdDate: NodeFactory.createUri(p + 'createdDate'),
    creatorName: NodeFactory.createUri(p + 'creatorName'),
    precedingChangeSet: NodeFactory.createUri(p + 'precedingChangeSet'),
    removal: NodeFactory.createUri(p + 'removal'),
    statement: NodeFactory.createUri(p + 'statement'),
    subjectOfChange: NodeFactory.createUri(p + 'subjectOfChange'),
    service: NodeFactory.createUri(p + 'service'),
    graph: NodeFactory.createUri(p + 'graph'),
    transaction: NodeFactory.createUri(p + 'transaction')
};

module.exports = ns;
