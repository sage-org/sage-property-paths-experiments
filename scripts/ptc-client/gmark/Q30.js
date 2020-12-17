const { eval, build_resume_query } = require('./../engine')
const { ResultSet } = require('./../result-set')

let queries = [
    `PREFIX : <http://example.org/gmark/> 
    SELECT ?x3 ?x0 
    WHERE { 
        ?x0 (:pconductor) ?v0 . ?v0 (:plike) ?v1 . ?v1 (^:pincludes) ?x1 . 
        ?x1 ((:pincludes/^:pincludes))+ ?x2 . 
        ?x2 (:peligibleQuantity) ?x3 . 
    }`,
    `PREFIX : <http://example.org/gmark/> 
    SELECT ?x3 ?x0 
    WHERE { 
        ?x0 (:pconductor) ?v0 . ?v0 (:plike) ?v1 . ?v1 (^:pincludes) ?x1 .
        ?x1 ((:pincludes/^:pincludes))+ ?x2 . 
        ?x2 (:pincludes) ?v2 . ?v2 (:pcontentRating) ?x3 . 
    }`,
    `PREFIX : <http://example.org/gmark/> 
    SELECT ?x3 ?x0 
    WHERE { 
        ?x0 (:pconductor) ?v0 . ?v0 (:plike) ?v1 . ?v1 (^:pincludes) ?x1 .
        ?x1 ((:pincludes/^:pincludes))+ ?x2 . 
        ?x2 (:peligibleQuantity) ?x3 . 
    }`,
    `PREFIX : <http://example.org/gmark/> 
    SELECT ?x3 ?x0 
    WHERE { 
        ?x0 (:pconductor) ?v0 . ?v0 (:plike) ?v1 . ?v1 (^:pincludes) ?x1 .
        ?x1 ((:pincludes/^:pincludes))+ ?x2 . 
        ?x2 (:pincludes) ?v2 . ?v2 (:pcontentRating) ?x3 . 
    }`
]

async function run(client, graph) {
    let result_set = new ResultSet()
    result_set.bgp = 1
    await eval(queries[0], client, graph, result_set, (state) => {
        let projection = '?x0'
        let triples = [
            {subject: '?x0', predicate: '(:pconductor)', object: '?v0'},
            {subject: '?v0', predicate: '(:plike)', object: '?v1'},
            {subject: '?v1', predicate: '(^:pincludes)', object: '?x1'},
            {subject: '?x1', predicate: '((:pincludes/^:pincludes))+', object: '?x2', path: 'Path(Path(http://example.org/gmark/pincludes / Path(~http://example.org/gmark/pincludes))+)'},
            {subject: '?x2', predicate: '(:peligibleQuantity)', object: '?x3'}
        ]
        return build_resume_query(projection, triples, state)
    })
    result_set.bgp = 2
    await eval(queries[1], client, graph, result_set, (state) => {
        let projection = '?x0'
        let triples = [
            {subject: '?x0', predicate: '(:pconductor)', object: '?v0'},
            {subject: '?v0', predicate: '(:plike)', object: '?v1'},
            {subject: '?v1', predicate: '(^:pincludes)', object: '?x1'},
            {subject: '?x1', predicate: '((:pincludes/^:pincludes))+', object: '?x2', path: 'Path(Path(http://example.org/gmark/pincludes / Path(~http://example.org/gmark/pincludes))+)'},
            {subject: '?x2', predicate: '(:pincludes)', object: '?v2'},
            {subject: '?v2', predicate: '(:pcontentRating)', object: '?x3'}
        ]
        return build_resume_query(projection, triples, state)
    })
    result_set.bgp = 3
    await eval(queries[2], client, graph, result_set, (state) => {
        let projection = '?x0'
        let triples = [
            {subject: '?x0', predicate: '(:pconductor)', object: '?v0'},
            {subject: '?v0', predicate: '(:plike)', object: '?v1'},
            {subject: '?v1', predicate: '(^:pincludes)', object: '?x1'},
            {subject: '?x1', predicate: '((:pincludes/^:pincludes))+', object: '?x2', path: 'Path(Path(http://example.org/gmark/pincludes / Path(~http://example.org/gmark/pincludes))+)'},
            {subject: '?x2', predicate: '(:peligibleQuantity)', object: '?x3'}
        ]
        return build_resume_query(projection, triples, state)
    })
    result_set.bgp = 4
    await eval(queries[3], client, graph, result_set, (state) => {
        let projection = '?x0'
        let triples = [
            {subject: '?x0', predicate: '(:pconductor)', object: '?v0'},
            {subject: '?v0', predicate: '(:plike)', object: '?v1'},
            {subject: '?v1', predicate: '(^:pincludes)', object: '?x1'},
            {subject: '?x1', predicate: '((:pincludes/^:pincludes))+', object: '?x2', path: 'Path(Path(http://example.org/gmark/pincludes / Path(~http://example.org/gmark/pincludes))+)'},
            {subject: '?x2', predicate: '(:pincludes)', object: '?v2'},
            {subject: '?v2', predicate: '(:pcontentRating)', object: '?x3'}
        ]
        return build_resume_query(projection, triples, state)
    })
    let solutions = result_set.solutions() 
    console.log(`Number of solutions: ${solutions.length}`)
    return result_set
}

module.exports = { 'run': run }