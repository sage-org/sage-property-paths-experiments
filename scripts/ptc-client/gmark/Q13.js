const { eval, build_resume_query } = require('./../engine')
const { ResultSet } = require('./../result-set')

let queries = [
    `PREFIX : <http://example.org/gmark/> 
    SELECT ?x3 ?x1 ?x2 ?x0 
    WHERE { 
        ?x0 (^:phomepage) ?v0 . ?v0 (^:plike) ?v1 . ?v1 (:phomepage) ?x1 . 
        ?x1 (^:phomepage) ?v2 . ?v2 (:phomepage) ?x2 . 
        ?x2 ((^:phomepage/:phomepage))+ ?x3 . 
        ?x3 ((^:ptrailer/:ptrailer))+ ?x4 . 
    }`,
    `PREFIX : <http://example.org/gmark/> 
    SELECT ?x3 ?x0 
    WHERE { 
        ?x0 (^:phomepage) ?v0 . ?v0 (^:plike) ?v1 . ?v1 (:phomepage) ?x1 . 
        ?x1 (^:phomepage) ?v2 . ?v2 (:pfriendOf) ?v3 . ?v3 (:psubscribes) ?x2 . 
        ?x2 (((^:phomepage/:phomepage)))+ ?x3 . 
        ?x3 (((^:ptrailer/:ptrailer)))+ ?x4 .
    }`,
    `PREFIX : <http://example.org/gmark/> 
    SELECT ?x3 ?x0 
    WHERE { 
        ?x0 (^:phomepage) ?v0 . ?v0 (^:plike) ?v1 . ?v1 (:psubscribes) ?x1 . 
        ?x1 (^:phomepage) ?v2 . ?v2 (:phomepage) ?x2 . 
        ?x2 (((^:phomepage/:phomepage)))+ ?x3 . 
        ?x3 (((^:ptrailer/:ptrailer)))+ ?x4 .
    }`,
    `PREFIX : <http://example.org/gmark/> 
    SELECT ?x3 ?x0 
    WHERE { 
        ?x0 (^:phomepage) ?v0 . ?v0 (^:plike) ?v1 . ?v1 (:psubscribes) ?x1 . 
        ?x1 (^:phomepage) ?v2 . ?v2 (:pfriendOf) ?v3 . ?v3 (:psubscribes) ?x2 . 
        ?x2 (((^:phomepage/:phomepage)))+ ?x3 . 
        ?x3 (((^:ptrailer/:ptrailer)))+ ?x4 .
    }`
]

async function run(client, graph) {
    let result_set = new ResultSet()
    result_set.bgp = 1
    await eval(queries[0], client, graph, result_set, (state) => {
        let projection = '?x0'
        let triples = [
            {subject: '?x0', predicate: '(^:phomepage)', object: '?v0'},
            {subject: '?v0', predicate: '(^:plike)', object: '?v1'},
            {subject: '?v1', predicate: '(:phomepage)', object: '?x1'},

            {subject: '?x1', predicate: '(^:phomepage)', object: '?v2'},
            {subject: '?v2', predicate: '(:phomepage)', object: '?x2'},
            
            {subject: '?x2', predicate: '((^:phomepage/:phomepage))+', object: '?x3', path: 'Path(Path(Path(~http://example.org/gmark/phomepage) / http://example.org/gmark/phomepage)+)'},
            {subject: '?x3', predicate: '((^:ptrailer/:ptrailer))+', object: '?x4', path: 'Path(Path(Path(~http://example.org/gmark/ptrailer) / http://example.org/gmark/ptrailer)+)'}
        ]
        return build_resume_query(projection, triples, state)
    })
    result_set.bgp = 2
    await eval(queries[1], client, graph, result_set, (state) => {
        let projection = '?x0'
        let triples = [
            {subject: '?x0', predicate: '(^:phomepage)', object: '?v0'},
            {subject: '?v0', predicate: '(^:plike)', object: '?v1'},
            {subject: '?v1', predicate: '(:phomepage)', object: '?x1'},

            {subject: '?x1', predicate: '(^:phomepage)', object: '?v2'},
            {subject: '?v2', predicate: '(:pfriendOf)', object: '?v3'},
            {subject: '?v3', predicate: '(:psubscribes)', object: '?x2'},

            {subject: '?x2', predicate: '((^:phomepage/:phomepage))+', object: '?x3', path: 'Path(Path(Path(~http://example.org/gmark/phomepage) / http://example.org/gmark/phomepage)+)'},
            {subject: '?x3', predicate: '((^:ptrailer/:ptrailer))+', object: '?x4', path: 'Path(Path(Path(~http://example.org/gmark/ptrailer) / http://example.org/gmark/ptrailer)+)'}
        ]
        return build_resume_query(projection, triples, state)
    })
    result_set.bgp = 3
    await eval(queries[2], client, graph, result_set, (state) => {
        let projection = '?x0'
        let triples = [
            {subject: '?x0', predicate: '(^:phomepage)', object: '?v0'},
            {subject: '?v0', predicate: '(^:plike)', object: '?v1'},
            {subject: '?v1', predicate: '(:psubscribes)', object: '?x1'},

            {subject: '?x1', predicate: '(^:phomepage)', object: '?v2'},
            {subject: '?v2', predicate: '(:phomepage)', object: '?x2'},

            {subject: '?x2', predicate: '((^:phomepage/:phomepage))+', object: '?x3', path: 'Path(Path(Path(~http://example.org/gmark/phomepage) / http://example.org/gmark/phomepage)+)'},
            {subject: '?x3', predicate: '((^:ptrailer/:ptrailer))+', object: '?x4', path: 'Path(Path(Path(~http://example.org/gmark/ptrailer) / http://example.org/gmark/ptrailer)+)'}
        ]
        return build_resume_query(projection, triples, state)
    })
    result_set.bgp = 4
    await eval(queries[3], client, graph, result_set, (state) => {
        let projection = '?x0'
        let triples = [
            {subject: '?x0', predicate: '(^:phomepage)', object: '?v0'},
            {subject: '?v0', predicate: '(^:plike)', object: '?v1'},
            {subject: '?v1', predicate: '(:psubscribes)', object: '?x1'},

            {subject: '?x1', predicate: '(^:phomepage)', object: '?v2'},
            {subject: '?v2', predicate: '(:pfriendOf)', object: '?v3'},
            {subject: '?v3', predicate: '(:psubscribes)', object: '?x2'},

            {subject: '?x2', predicate: '((^:phomepage/:phomepage))+', object: '?x3', path: 'Path(Path(Path(~http://example.org/gmark/phomepage) / http://example.org/gmark/phomepage)+)'},
            {subject: '?x3', predicate: '((^:ptrailer/:ptrailer))+', object: '?x4', path: 'Path(Path(Path(~http://example.org/gmark/ptrailer) / http://example.org/gmark/ptrailer)+)'}
        ]
        return build_resume_query(projection, triples, state)
    })
    let solutions = result_set.solutions() 
    console.log(`Number of solutions: ${solutions.length}`)
    return result_set
}

module.exports = { 'run': run }