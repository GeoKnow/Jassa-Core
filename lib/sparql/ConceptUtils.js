

/**
 * Combines the elements of two concepts, yielding a new concept.
 * The new concept used the variable of the second argument.
 * 
 */
ns.ConceptUtils = {

    /*
    createRenamedConcept: function(concept, newVar) {

        // TODO Rename variables if the newVar clashes with existing names

        var oldVar = concept.getVar();
        var vs = element.getVarsMentioned();

        // Rename any variables that would clash 
        var varMap = ns.ElementUtils.createDistinctVarMap(vs, [oldVar]);
        var tmpElement = ns.ElementUtils.createRenamedElement(element, varMap);

        var newVarMap = new util.HashBidiMap();
        newVarMap.put(oldVar, newVar);
        var newElement = ns.ElementUtils.createRenamedElement(tmpElement, newVarMap);
        
        var result = new facete.Concept(newElement, newVar);
        return result;
    },*/
        
    createVarMap: function(attrConcept, filterConcept) {
        var attrElement = attrConcept.getElement();
        var filterElement = filterConcept.getElement();
        
        var attrVar = attrConcept.getVar();
        
        var attrVars = attrElement.getVarsMentioned();
        var filterVars = filterElement.getVarsMentioned();
         
        var attrJoinVars = [attrConcept.getVar()];
        var filterJoinVars = [filterConcept.getVar()];
         
        var result = sparql.ElementUtils.createJoinVarMap(attrVars, filterVars, attrJoinVars, filterJoinVars); //, varNameGenerator);

        return result;
    },
    
    createRenamedConcept: function(attrConcept, filterConcept) {
        
        var varMap = this.createVarMap(attrConcept, filterConcept);
        
        var attrVar = attrConcept.getVar();
        var filterElement = filterConcept.getElement();
        var newFilterElement = sparql.ElementUtils.createRenamedElement(filterElement, varMap);
        
        var result = new ns.Concept(newFilterElement, attrVar);
        
        return result;
    },
    
    /**
     * Combines two concepts into a new one. Thereby, one concept plays the role of the attribute concepts whose variable names are left untouched,
     * The other concept plays the role of the 'filter' which limits the former concept to certain items.
     * 
     * 
     */
    createCombinedConcept: function(attrConcept, filterConcept, renameVars, attrsOptional, filterAsSubquery) {
        // TODO The variables of baseConcept and tmpConcept must match!!!
        // Right now we just assume that.
        
        
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
        var attrVar = attrConcept.getVar();
        var attrElement = attrConcept.getElement();
        
        var e;
        if(tmpElements.length > 0) {

            if(tmpConcept.isSubjectConcept()) {
                e = attrConcept.getElement(); //tmpConcept.getElement();
            } else {    
                
                var newElements = [];

                if(attrsOptional) {
                    attrElement = new sparql.ElementOptional(attrConcept.getElement());
                }                    
                newElements.push(attrElement);

                if(filterAsSubquery) {
                    tmpElements = [new sparql.ElementSubQuery(tmpConcept.asQuery())];
                }

                
                //newElements.push.apply(newElements, attrElement);
                newElements.push.apply(newElements, tmpElements);
                
                
                e = new sparql.ElementGroup(newElements);
                e = e.flatten();
            }
        } else {
            e = attrElement;
        }
        
        var concept = new ns.Concept(e, attrVar);

        return concept;
    },
    
    createSubjectConcept: function(s, p, o) {
        
        //var s = sparql.Node.v("s");
        s = s || rdf.NodeFactory.createVar('s');
        p = p || rdf.NodeFactory.createVar('_p_');
        o = o || rdf.NodeFactory.createVar('_o_');
        
        var conceptElement = new sparql.ElementTriplesBlock([new rdf.Triple(s, p, o)]);

        //pathManager = new facets.PathManager(s.value);
        
        var result = new ns.Concept(conceptElement, s);

        return result;
    },
    
    /**
     * 
     * @param typeUri A jassa.rdf.Node or string denoting the URI of a type
     * @param subjectVar Optional; variable of the concept, specified either as string or subclass of jassa.rdf.Node
     */
    createTypeConcept: function(typeUri, subjectVar) {            
        var type = typeUri instanceof rdf.Node ? typeUri : rdf.NodeFactory.createUri(typeUri);            
        var vs = !subjectVar ? rdf.NodeFactory.createVar('s') :
            (subjectVar instanceof rdf.Node ? subjectVar : rdf.NodeFactory.createVar(subjectVar));            

        var result = new ns.Concept(new sparql.ElementTriplesBlock([new rdf.Triple(vs, vocab.rdf.type, type)]), vs);      
        return result;
    },


    /**
     * Creates a query based on the concept
     * TODO: Maybe this should be part of a static util class?
     */
    createQueryList: function(concept, limit, offset) {
        var result = new sparql.Query();
        result.setDistinct(true);
        
        result.setLimit(limit);
        result.setOffset(offset);
        
        result.getProject().add(concept.getVar());
        var resultElements = result.getElements();
        var conceptElements = concept.getElements();

        resultElements.push.apply(resultElements, conceptElements);
        
        return result;
    },

    createNewVar: function(concept, baseVarName) {
        baseVarName = baseVarName || 'c';

        var varsMentioned = concept.getVarsMentioned();

        var varGen = sparql.VarUtils.createVarGen(baseVarName, varsMentioned);
        var result = varGen.next();
        
        return result;
    },
    
    createQueryCount: function(concept, outputVar, scanLimit) {
        var result = ns.QueryUtils.createQueryCount(concept.getElements(), scanLimit, concept.getVar(), outputVar, null, true);
        
        return result;
    },

};

module.exports = ConceptUtils;

