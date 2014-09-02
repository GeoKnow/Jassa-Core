//
//var DiffUtils = {
//    getState: function(isExpected, isActual) {
//        var result;
//
//        if(isExpected) {
//            if(isActual) {
//                result = 'covered';
//            } else {
//                result = 'uncovered';
//            }
//        } else {
//            if(isActual) {
//                result = 'excessive';
//            } else {
//                result = 'invalid';
//            }
//        }
//
//        return result;
//    },
//
//    /**
//     * This methods expects the following structure for both of the arguments:
//     * Map<Node, Map<Node, List<Node>>>
//     *
//     * @param expected
//     * @param actual
//     * @returns
//     */
//    createDiff: function(expected, actual) {
//
//
//        var result = DiffUtils.diffResource(expected, actual, function(expected, actual) {
//            var result = DiffUtils.diffResource(expected, actual, function(expected, actual) {
//                var result = DiffUtils.diffObjects(_.values(expected), _.values(actual));
//                return result;
//            });
//            return result;
//        });
//
//        return result;
//    },
//
//    /**
//     * Expects hashmaps as input
//     *
//     * @param expected
//     * @param actual
//     * @param fnProcessChildren
//     * @returns {Array}
//     */
//    diffResource: function(expected, actual, fnProcessChildren) {
//        var result = [];
//
//        // Get all subjects
//        var items =
//            _.chain(_.keys(expected))
//            .union(_.keys(actual))
//            .uniq()
//            .sort()
//            .value();
//
//        //console.log("[diffResource] items: ", items)
//
//        for(var i = 0; i < items.length; ++i) {
//            var item = items[i];
//
//            //console.log('[diffResource] item:', item);
//
//            var isExpected = item in expected;
//            var isActual = item in actual;
//
//            var state = DiffUtils.getState(isExpected, isActual);
//
//            var expectedChildren = item in expected ? expected[item] : {};
//            var actualChildren = item in actual ? actual[item] : {};
//
//            var children = fnProcessChildren(expectedChildren, actualChildren);
//
//            result.push({
//                item: item,
//                state: state,
//                children: children
//            });
//        }
//
//        return result;
//    },
//
//    diffObjects: function(expected, actual) {
//
//        var union = [];
//        union.push.apply(all, expected);
//        union.push.apply(all, actual);
//
////		var items = _.chain().union(expected, actual).uniq(false, rdfObjectToString).sortBy(rdfObjectToString).value();
//
//        var uniq = _.uniq(union, false, rdfObjectToString);
//        var items = _.sortBy(uniq, rdfObjectToString);
//        //console.log("items", items, expected, actual);
//
//
//        var result = [];
//
//        for(var i = 0; i < items.length; ++i) {
//            var item = items[i];
//
//            var isExpected = myIndexOf(expected, item) != -1;
//            var isActual = myIndexOf(actual, item) != -1;
//            //console.log("On item: ", item, isExpected, isActual);
//
//            var state = ns.getState(isExpected, isActual);
//
//            var resultItem = {
//                item: item,
//                state:state
//            };
//
//            result.push(resultItem);
//        }
//
//        return result;
//    },
//
//
//    /* Forget about the rest of the code - No more rendering in Js thanks to Angular
//    ns.renderResource = function(item) {
//        var str = item.item;
//        for(var key in predicatesURLs){
//            if(str.indexOf(key) !== -1){
//                str = str.replace(key, predicatesURLs[key]+":");
//                break;
//            }
//        }
//        var text = utils.escapeHTML(str);
//        var result = '<span class="' + item.state + '">' + text + '</span>';
//
//        return result;
//    }
//
//    ns.renderObject = function(item) {
//        var json = item.item;
//        var node = sparql.Node.fromJson(json);
//        var str = node.toString();
//        var text = utils.escapeHTML(str);
//        var result = '<span class="' + item.state + '">' + text + '</span>';
//
//        return result;
//    }
//
//    ns.renderDiff = function(subjects) {
//
//        var result = '';
//
//        // collapsible details
//        result += '<div class="accordion" id="resultAccordion'+widgetsCount+'">';
//        result += '<div class="accordion-group">';
//        result += '<div class="accordion-heading">';
//        //result += '<a class="accordion-toggle" data-toggle="collapse" data-parent="#resultAccordion'+widgetsCount+'" href="#collapseDetails'+widgetsCount+'">Show details</a>';
//        result += '</div>';
//        result += '<div id="collapseDetails'+widgetsCount+'" class="accordion-body">'; //collapse
//        result += '<div class="accordion-inner">';
//
//        // data rendering stuff
//        result += '<ul class="separated bullets-none">';
//
//        for(var i = 0; i < subjects.length; ++i) {
//            var subject = subjects[i];
//
//            result += '</li>';
////				result += '<tr>'
////				result += '<td>';
//            result += ns.renderResource(subject);
//            //result += '</td><td>';
//
//            var predicateStr = '<table class="separated-vertical" style="margin-left:15px; margin-bottom: 15px;">';
//
//            // TODO color
//            var predicates = subject.children;
//
//            for(var j = 0; j < predicates.length; ++j) {
//                var predicate = predicates[j];
//
//                predicateStr += '<tr>';
//                predicateStr += '<td style=" vertical-align: top;">' + ns.renderResource(predicate) + '</td>';
//
//                var objectStr = '<td><ul class="separated bullets-none">';
//
//                var objects = predicate.children;
//                for(var k = 0; k < objects.length; ++k) {
//                    var object = objects[k];
//
//                    var str = ns.renderObject(object);
//
//                    objectStr += '<li>' + str + '</li>';
//                }
//
//                objectStr += '</ul></td>';
//
//                predicateStr += objectStr;
//                predicateStr += '</tr>';
//            }
//
//            predicateStr += '</table>';
//
//            result += predicateStr;
//
//            //result += '</td>';
//            //result += '</tr>';
//            result += '</li>';
//
//        }
//
//        //result += "</table>"
//        result += '</ul>';
//
//        // close collapsible
//        result += '</div>';
//        result += '</div>';
//        result += '</div>';
//        result += '</div>';
//
//        // increase widget count
//        widgetsCount++;
//
//        return result;
//    }
//*/
//
//};
//
//module.exports = DiffUtils;
//
