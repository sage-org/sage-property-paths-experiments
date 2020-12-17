const { eval, build_resume_query } = require('./../engine')
const { ResultSet } = require('./../result-set')

let queries = [
    `PREFIX : <http://example.org/gmark/> 
    SELECT ?x2 ?x3 ?x0 ?x1 
    WHERE { 
        ?x0 (:pincludes) ?v0 . ?v0 (:peditor) ?v1 . ?v1 (:plike) ?x1 . 
        ?x1 ((^:ppurchaseFor/:ppurchaseFor)|(:phomepage/^:phomepage))+ ?x2 . 
        ?x2 (:pconductor) ?v2 . ?v2 (:pfriendOf) ?v3 . ?v3 (^:pactor) ?x3 .
    }`,
    `PREFIX : <http://example.org/gmark/> 
    SELECT ?x2 ?x3 ?x0 ?x1 
    WHERE { 
        ?x0 (:pincludes) ?v0 . ?v0 (:pconductor) ?v1 . ?v1 (:plike) ?x1 . 
        ?x1 ((^:ppurchaseFor/:ppurchaseFor)|(:phomepage/^:phomepage))+ ?x2 . 
        ?x2 (:pconductor) ?v2 . ?v2 (:pfriendOf) ?v3 . ?v3 (^:pactor) ?x3 .
    }`
]

async function run(client, graph) {
    let result_set = new ResultSet()
    result_set.bgp = 1
    await eval(queries[0], client, graph, result_set, (state) => {
        let projection = '?x0'
        let triples = [
            {subject: '?x0', predicate: '(:pincludes)', object: '?v0'},
            {subject: '?v0', predicate: '(:peditor)', object: '?v1'},
            {subject: '?v1', predicate: '(:plike)', object: '?x1'},
            {subject: '?x1', predicate: '((^:ppurchaseFor/:ppurchaseFor)|(:phomepage/^:phomepage))+', object: '?x2', path: 'Path(Path(Path(Path(~http://example.org/gmark/ppurchaseFor) / http://example.org/gmark/ppurchaseFor) | Path(http://example.org/gmark/phomepage / Path(~http://example.org/gmark/phomepage)))+)'},
            {subject: '?x2', predicate: '(:pconductor)', object: '?v2'},
            {subject: '?v2', predicate: '(:pfriendOf)', object: '?v3'},
            {subject: '?v3', predicate: '(^:pactor)', object: '?x3'}
        ]
        return build_resume_query(projection, triples, state)
    })
    result_set.bgp = 2
    await eval(queries[1], client, graph, result_set, (state) => {
        let projection = '?x0'
        let triples = [
            {subject: '?x0', predicate: '(:pincludes)', object: '?v0'},
            {subject: '?v0', predicate: '(:pconductor)', object: '?v1'},
            {subject: '?v1', predicate: '(:plike)', object: '?x1'},
            {subject: '?x1', predicate: '((^:ppurchaseFor/:ppurchaseFor)|(:phomepage/^:phomepage))+', object: '?x2', path: 'Path(Path(Path(Path(~http://example.org/gmark/ppurchaseFor) / http://example.org/gmark/ppurchaseFor) | Path(http://example.org/gmark/phomepage / Path(~http://example.org/gmark/phomepage)))+)'},
            {subject: '?x2', predicate: '(:pconductor)', object: '?v2'},
            {subject: '?v2', predicate: '(:pfriendOf)', object: '?v3'},
            {subject: '?v3', predicate: '(^:pactor)', object: '?x3'}
        ]
        return build_resume_query(projection, triples, state)
    })
    let solutions = result_set.solutions() 
    console.log(`Number of solutions: ${solutions.length}`)
}

module.exports = { 'run': run }