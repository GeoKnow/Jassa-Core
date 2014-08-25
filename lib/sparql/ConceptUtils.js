var Node = require('../rdf/node/Node');
var NodeFactory = require('../rdf/NodeFactory');
var Triple = require('../rdf/Triple');

var HashMap = require('../util/collection/HashMap');

var rdf = require('./../vocab/rdf');

var VarUtils = require('./VarUtils');

var ElementUtils = require('./ElementUtils');

var ExprAggregator = require('./expr/ExprAggregator');
var AggCount = require('./agg/AggCount');

var ExprVar = require('./expr/ExprVar');
var E_Equals = require('./expr/E_Equals');

var ElementTriplesBlock = require('./element/ElementTriplesBlock');
var ElementOptional = require('./element/ElementOptional');
var ElementSubQuery = require('./element/ElementSubQuery');
var ElementGroup = require('./element/ElementGroup');
var ElementFilter = require('./element/ElementFilter');

var QueryUtils = require('./QueryUtils');
var NodeValueUtils = require('./NodeValueUtils');

var Query = require('./Query');

var Concept = require('./Concept');

/**
 * Combines the elements of two concepts, yielding a new concept.
 * The new concept used the variable of the second argument.
 *
 */
var ConceptUtils = {

    createVarMap: function(attrConcept, filterConcept) {
        var attrElement = attrConcept.getElement();
        var filterElement = filterConcept.getElement();

        var attrVar = attrConcept.getVar();

        var attrVars = attrElement.getVarsMentioned();
        var filterVars = filterElement.getVarsMentioned();

        var attrJoinVars = [attrConcept.getVar()];
        var filterJoinVars = [filterConcept.getVar()];

        var result = ElementUtils.createJoinVarMap(attrVars, filterVars, attrJoinVars, filterJoinVars); //, varNameGenerator);

        return result;
    },

    createRenamedConcept: function(attrConcept, filterConcept) {

        var varMap = this.createVarMap(attrConcept, filterConcept);

        var attrVar = attrConcept.getVar();
        var filterElement = filterConcept.getElement();
        var newFilterElement = ElementUtils.createRenamedElement(filterElement, varMap);

        var result = new Concept(newFilterElement, attrVar);

        return result;
    },

    renameVars: function(concept, varMap) {
        var fnSubst = VarUtils.fnSubst(varMap);

        var newVar = fnSubst(concept.getVar());
        var newElement = concept.getElement().copySubstitute(fnSubst);

        var result = new Concept(newElement, newVar);
        return result;

    },


    /**
     * Combines two concepts into a new one. Thereby, one concept plays the role of the attribute concepts whose variable names are left untouched,
     * The other concept plays the role of the 'filter' which limits the former concept to certain items.
     *
     *
     */
    createCombinedConcept: function(attrConcept, filterConcept, renameVars, attrsOptional, filterAsSubquery) {
        // TODO Is it ok to rename vars here? // TODO The variables of baseConcept and tmpConcept must match!!!
        // Right now we just assume that.
        var attrVar = attrConcept.getVar();
        var filterVar = filterConcept.getVar();

        if(!filterVar.equals(attrVar)) {
            var varMap = new HashMap();
            varMap.put(filterVar, attrVar);
            filterConcept = this.renameVars(filterConcept, varMap);
        }

        var tmpConcept;
        if(renameVars) {
            tmpConcept = this.createRenamedConcept(attrConcept, filterConcept);
        } else {
            tmpConcept = filterConcept;
        }


        var tmpElements = tmpConcept.getElements();


        // Small workaround (hack) with constraints on empty paths:
        // In this case, the tmpConcept only provides filters but
        // no triples, so we have to include the base concept
        //var hasTriplesTmp = tmpConcept.hasTriples();
        //hasTriplesTmp &&
        var attrElement = attrConcept.getElement();

        var e;
        if(tmpElements.length > 0) {

            if(tmpConcept.isSubjectConcept()) {
                e = attrConcept.getElement(); //tmpConcept.getElement();
            } else {

                var newElements = [];

                if(attrsOptional) {
                    attrElement = new ElementOptional(attrConcept.getElement());
                }
                newElements.push(attrElement);

                if(filterAsSubquery) {
                    tmpElements = [new ElementSubQuery(tmpConcept.asQuery())];
                }


                //newElements.push.apply(newElements, attrElement);
                newElements.push.apply(newElements, tmpElements);


                e = new ElementGroup(newElements);
                e = e.flatten();
            }
        } else {
            e = attrElement;
        }

        var concept = new Concept(e, attrVar);

        return concept;
    },

    createSubjectConcept: function(s, p, o) {

        //var s = sparql.Node.v("s");
        s = s || VarUtils.s;
        p = p || VarUtils._p_;
        o = o || VarUtils._o_;

        var conceptElement = new ElementTriplesBlock([new Triple(s, p, o)]);

        //pathManager = new facets.PathManager(s.value);

        var result = new Concept(conceptElement, s);

        return result;
    },

    /**
     *
     * @param typeUri A jassa.rdf.Node or string denoting the URI of a type
     * @param subjectVar Optional; variable of the concept, specified either as string or subclass of jassa.rdf.Node
     */
    createTypeConcept: function(typeUri, subjectVar) {
        var type = typeUri instanceof Node ? typeUri : NodeFactory.createUri(typeUri);
        var vs = !subjectVar ? NodeFactory.createVar('s') :
            (subjectVar instanceof Node ? subjectVar : NodeFactory.createVar(subjectVar));

        var result = new Concept(new ElementTriplesBlock([new Triple(vs, rdf.type, type)]), vs);
        return result;
    },

    /**
     * Creates a query based on the concept
     * TODO: Maybe this should be part of a static util class?
     */
    createQueryList: function(concept, limit, offset) {
//        var element = concept.getElement();
//        if(element instanceof ElementOptional) {
//            element = element.getOptionalElement();
//        }

        var result = new Query();
        result.setDistinct(true);

        result.setLimit(limit);
        result.setOffset(offset);

        result.getProject().add(concept.getVar());
        result.setQueryPattern(concept.getElement());

        return result;
    },

    freshVar: function(concept, baseVarName) {
        baseVarName = baseVarName || 'c';

        var varsMentioned = concept.getVarsMentioned();

        var varGen = VarUtils.createVarGen(baseVarName, varsMentioned);
        var result = varGen.next();

        return result;
    },

    // Util for cerateQueryCount
    wrapAsSubQuery: function(query, v) {
        var esq = new ElementSubQuery(query);

        var result = new Query();
        result.setQuerySelectType();
        result.getProject().add(v);
        result.setQueryPattern(esq);

        return result;
    },

    createQueryCount: function(concept, outputVar, itemLimit, rowLimit) {
        var subQuery = this.createQueryList(concept);

        if(rowLimit != null) {
            subQuery.setDistinct(false);
            subQuery.setLimit(rowLimit);

            subQuery = this.wrapAsSubQuery(subQuery, concept.getVar());
            subQuery.setDistinct(true);
        }

        if(itemLimit != null) {
            subQuery.setLimit(itemLimit);
        }

        var esq = new ElementSubQuery(subQuery);

        var result = new Query();
        result.setQuerySelectType();
        result.getProject().add(outputVar, new ExprAggregator(null, new AggCount()));//new ExprAggregator(concept.getVar(), new AggCount()));
        result.setQueryPattern(esq);

        return result;
    },



    /**
     * Create a query to check the 'raw-size' of the concept for one of its values -i.e. the number of non-distinct occurrences
     *
     * Select ?s (Count(*) As ?countVar) {
     *   Select ?s {
     *       conceptElement
     *       Filter(?s = valueOfNode)
     *   } Limit rowLimit
     * }
     *
     * if the rowLimit is omitted, this becomes
     *
     * Select ?s (Count(*) As ?countVar) {
     *       conceptElement
     *       Filter(?s = valueOfNode)
     * }
     *
     */
    createQueryRawSize: function(concept, sourceValue, countVar, rowLimit) {
        var s = concept.getVar();
        var baseElement = concept.getElement();

        var es = new ExprVar(s);
        var nv = NodeValueUtils.makeNode(sourceValue);
        var filter = new ElementFilter(new E_Equals(es, nv));

        var subElement = (new ElementGroup([baseElement, filter])).flatten();

        if(rowLimit != null) {
            var subQuery = new Query();
            subQuery.setQuerySelectType();
            subQuery.getProject().add(s);
            //subQuery.getProject.add(o);
            subQuery.setQueryPattern(subElement);
            subQuery.setLimit(rowLimit);

            subElement = new ElementSubQuery(subQuery);
        }

        var result = new Query();
        result.setQuerySelectType();
        result.getProject().add(s);
        result.getProject().add(countVar, new ExprAggregator(null, new AggCount()));
        result.setQueryPattern(subElement);
        result.getGroupBy().push(es);

        return result;
    },
/*
Concrete example for above:

Select ?p (Count(*) As ?c) {
  { Select ?p {
    ?s ?p ?o .
    Filter(?p = rdf:type)
  } Limit 1000 }
} Group By ?p

without rowLimit:

Select ?p (Count(*) As ?c) {
  ?s ?p ?o .
  Filter(?p = rdf:type)
} Group By ?p


 */

    isGroupedOnlyByVar: function(query, groupVar) {
        var result = false;

        var hasOneGroup = query.getGroupBy().length === 1;
        if(hasOneGroup) {
            var expr = query.getGroupBy()[0];
            if(expr instanceof ExprVar) {
                var v = expr.asVar();

                result = v.equals(groupVar);
            }
        }

        return result;
    },

    isDistinctConceptVar: function(query, conceptVar) {
        var isDistinct = query.isDistinct();

        var projectVars = query.getProjectVars();

        var hasSingleVar = !query.isQueryResultStar() && projectVars && projectVars.length === 1;
        var result = isDistinct && hasSingleVar && projectVars[0].equals(conceptVar);
        return result;
    },


    /**
     * Checks whether the query's projection is distinct (either by an explicit distinct or an group by)
     * and only has a single
     * variable matching a requested one
     *
     */
    isConceptQuery: function(query, conceptVar) {
        var isDistinctGroupByVar = this.isGroupedOnlyByVar(query, conceptVar);
        var isDistinctConceptVar = this.isDistinctConceptVar(query, conceptVar);

        var result = isDistinctGroupByVar || isDistinctConceptVar;
        return result;
    },

    /**
     * Filters a variable of a given query against a given concept
     *
     * If there is a grouping on the attrVar, e.g.
     * Select ?s Count(Distinct ?x) { ... }
     *
     *
     * @param attrQuery
     * @param attrVar
     * @param isLeftJoin
     * @param filterConcept
     * @param limit
     * @param offset
     * @returns
     */
    /*
    createAttrQuery: function(attrQuery, attrVar, isLeftJoin, filterConcept, limit, offset) {
        var result = isLeftJoin
            ? this.createAttrQueryLeftJoin(attrQuery, attrVar, filterConcept, limit, offset)
            : this.createAttrQueryJoin(attrQuery, attrVar, filterConcept, limit, offset);

        return result;
    },

    createAttrQueryLeftJoin: function(attrQuery, attrVar, filterConcept, limit, offset) {
        throw new Error('Not implemented yet');
    },
    */

    // TODO This method sucks, as it tries to handle too many cases, figure out how to improve it
    /*jshint maxdepth:10 */
    createAttrQuery: function(attrQuery, attrVar, isLeftJoin, filterConcept, limit, offset) {

        var attrConcept = new Concept(new ElementSubQuery(attrQuery), attrVar);

        var renamedFilterConcept = ConceptUtils.createRenamedConcept(attrConcept, filterConcept);


        // Selet Distinct ?ori ?gin? alProj { Select (foo as ?ori ...) { originialElement} }

        // Whether each value for attrVar uniquely identifies a row in the result set
        // In this case, we just join the filterConcept into the original query
        var isAttrVarPrimaryKey = this.isConceptQuery(attrQuery, attrVar);

        var result;
        if(isAttrVarPrimaryKey) {
            // Case for e.g. Get the number of products offered by vendors in Europe
            // Select ?vendor Count(Distinct ?product) { ... }

            result = attrQuery.clone();

            if(!renamedFilterConcept.isSubjectConcept()) {
                var newElement = new ElementGroup([attrQuery.getQueryPattern(), renamedFilterConcept.getElement()]);
                newElement = newElement.flatten();
                result.setQueryPattern(newElement);
            }

            result.setLimit(limit);
            result.setOffset(offset);
        } else {
            // Case for e.g. Get all products offered by some 10 vendors
            // Select ?vendor ?product { ... }

            var requireSubQuery = limit != null || offset != null;


            var newFilterElement;
            if(requireSubQuery) {
                var subConcept;
                if(isLeftJoin) {
                    subConcept = renamedFilterConcept;
                } else {
                    // If we do an inner join, we need to include the attrQuery's element in the sub query

                    var subElement;
                    if(renamedFilterConcept.isSubjectConcept()) {
                        subElement = attrQuery.getQueryPattern();
                    } else {
                        subElement = new ElementGroup([attrQuery.getQueryPattern(), renamedFilterConcept.getElement()]);
                    }

                    subConcept = new Concept(subElement, attrVar);
                }

                var subQuery = ConceptUtils.createQueryList(subConcept, limit, offset);
                newFilterElement = new ElementSubQuery(subQuery);
            }
            else {
                newFilterElement = renamedFilterConcept.getElement();
            }

//            var canOptimize = isAttrVarPrimaryKey && requireSubQuery && !isLeftJoin;
//
//            var result;
//
//            //console.log('Optimize: ', canOptimize, isAttrConceptQuery, requireSubQuery, isLeftJoin);
//            if(canOptimize) {
//                // Optimization: If we have a subQuery and the attrQuery's projection is only 'DISTINCT ?attrVar',
//                // then the subQuery is already the result
//                result = newFilterElement.getQuery();
//            } else {


            var query = attrQuery.clone();

            var attrElement = query.getQueryPattern();

            var newAttrElement;
            if(!requireSubQuery && (!filterConcept || filterConcept.isSubjectConcept())) {
                newAttrElement = attrElement;
            }
            else {
                if(isLeftJoin) {
                    newAttrElement = new ElementGroup([
                        newFilterElement,
                        new ElementOptional(attrElement)
                    ]);
                } else {
                    newAttrElement = new ElementGroup([
                        attrElement,
                        newFilterElement
                    ]);
                }
            }

            query.setQueryPattern(newAttrElement);
            result = query;
        }

        // console.log('Argh Query: ' + result, limit, offset);
        return result;
    },

};

module.exports = ConceptUtils;

