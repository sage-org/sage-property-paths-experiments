const { eval, build_resume_query } = require('./../engine')
const { ResultSet } = require('./../result-set')

let queries = [
    `PREFIX : <http://example.org/gmark/> 
    SELECT ?x0 ?x3
    WHERE { 
        ?x0 (:pactor) ?v0 . ?v0 (^:pemployee) ?x1 . 
        ?x1 (:pemployee) ?v1 . ?v1 (:plike) ?v2 . ?v2 (^:pincludes) ?x2 . 
        ?x2 ((:pincludes/^:pincludes))+ ?x3 . 
    }`
]

async function run(client, graph) {
    let result_set = new ResultSet()
    await eval(queries[0], client, graph, result_set, (state) => {
        let projection = '?x0 ?x3' 
        let triples = [
            {subject: '?x0', predicate: '(:pactor)', object: '?v0'},
            {subject: '?v0', predicate: '(^:pemployee)', object: '?x1'},
            {subject: '?x1', predicate: '(:pemployee)', object: '?v1'},
            {subject: '?v1', predicate: '(:plike)', object: '?v2'},
            {subject: '?v2', predicate: '(^:pincludes)', object: '?x2'},
            {subject: '?x2', predicate: '((:pincludes/^:pincludes))+', object: '?x3', path: 'Path(Path(http://example.org/gmark/pincludes / Path(~http://example.org/gmark/pincludes))+)'}
        ]
        return build_resume_query(projection, triples, state)
    })
    solutions = result_set.solutions()
    console.log(`Number of solutions: ${solutions.length}`)
}

module.exports = { 'run': run }