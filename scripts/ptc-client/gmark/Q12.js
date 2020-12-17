const { eval, build_resume_query } = require('../engine')
const { ResultSet } = require('../result-set')

let queries = [
    `PREFIX : <http://example.org/gmark/> 
    SELECT ?x2
    WHERE { 
        BIND(IRI("http://example.org/gmark/User_8090777") AS ?x0)
        ?x0 ((^:peditor/:peditor))+ ?x1 . 
        ?x1 (:plike) ?v0 . ?v0 (^:plike) ?x2 .
    }`
]

async function run(client, graph) {
    let result_set = new ResultSet()
    await eval(queries[0], client, graph, result_set, (state) => {
        let projection = '?x0' 
        let triples = [
            {subject: '?x0', predicate: '((^:peditor/:peditor))+', object: '?x1', path: 'Path(Path(Path(~http://example.org/gmark/peditor) / http://example.org/gmark/peditor)+)'},
            {subject: '?x1', predicate: '(:plike)', object: '?v0'},
            {subject: '?v0', predicate: '(^:plike)', object: '?x2'}
        ]
        return build_resume_query(projection, triples, state)
    })
    solutions = result_set.solutions()
    console.log(`Number of solutions: ${solutions.length}`)
}

module.exports = { 'run': run }