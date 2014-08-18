var Node = require('../rdf/node/Node');
var NodeFactory = require('../rdf/NodeFactory');
var Triple = require('../rdf/Triple');

var HashMap = require('../util/collection/HashMap');

var rdf = require('./../vocab/rdf');

var VarUtils = require('./VarUtils'); 

var ElementUtils = require('./ElementUtils');

var ExprAggregator = require('./expr/ExprAggregator');
var AggCount = require('./agg/AggCount');

var ElementTriplesBlock = require('./element/ElementTriplesBlock');
var ElementOptional = require('./element/ElementOptional');
var ElementSubQuery = require('./element/ElementSubQuery');
var ElementGroup = require('./element/ElementGroup');

var QueryUtils = require('./QueryUtils');

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
     * Checks whether the query's projection is distinct and only has a single
     * variable matching a requested one
     * 
     */
    isConceptQuery: function(query, conceptVar) {
        var isDistinct = query.isDistinct();
        var projectVars = query.getProjectVars();
        
        var hasSingleVar = projectVars && projectVars.length === 1;
        var result = hasSingleVar && projectVars[0].equals(conceptVar);
        
        return result;
    },
    
    createAttrQuery: function(attrQuery, attrVar, isLeftJoin, filterConcept, limit, offset) {

        // If no left join: clone the attrQuery, rename variables in filterConcept, add the renamed filter concept to the query
        // If left join: 
        var attrConcept = new Concept(new ElementSubQuery(attrQuery), attrVar);
        
        
        var renamedFilterConcept = ConceptUtils.createRenamedConcept(attrConcept, filterConcept);
        
        var newFilterElement;
        
        var requireSubQuery = limit != null || offset != null;

        if(requireSubQuery) {
            var subConcept;
            if(isLeftJoin) {
                subConcept = renamedFilterConcept;
            } else {
                // If we do an inner join, we need to include the attrQuery's element in the sub query
                var subElement = new ElementGroup([attrQuery.getQueryPattern(), renamedFilterConcept.getElement()]);
                subConcept = new Concept(subElement, attrVar);
            }
            
            var subQuery = ConceptUtils.createQueryList(subConcept, limit, offset);
            newFilterElement = new ElementSubQuery(subQuery);
        }
        else {
            newFilterElement = renamedFilterConcept.getElement();
        }
        
        var isAttrConceptQuery = this.isConceptQuery(attrQuery, attrVar);
        var canOptimize = isAttrConceptQuery && requireSubQuery && !isLeftJoin;
        
        var result;
        
        //console.log('Optimize: ', canOptimize, isAttrConceptQuery, requireSubQuery, isLeftJoin);
        if(canOptimize) {
            // Optimization: If we have a subQuery and the attrQuery's projection is only 'DISTINCT ?attrVar',
            // then the subQuery is already the result
            result = newFilterElement.getQuery();
        } else {
        
            
            var query = attrQuery.clone();
            
            var attrElement = query.getQueryPattern();
            
            var newAttrElement;
            if(!filterConcept || filterConcept.isSubjectConcept()) {
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

        //console.log('Query: ' + query);       
        return result;
    },

};

module.exports = ConceptUtils;

