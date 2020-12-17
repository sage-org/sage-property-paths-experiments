const { eval, build_resume_query } = require('./../engine')
const { ResultSet } = require('./../result-set')

let queries = [
    `PREFIX : <http://example.org/gmark/> 
    SELECT ?x0 ?x2 
    WHERE { 
        ?x1 (^:pconductor) ?v0 . ?v0 (:phomepage) ?v1 . ?v1 (^:phomepage) ?x2 .
        ?x0 (((:pfriendOf)))+ ?x1 .
    }`
]

async function run(client, graph) {
    let result_set = new ResultSet()
    await eval(queries[0], client, graph, result_set, (state) => {
        let projection = '?x0 ?x2'
        let triples = [
            {subject: '?x0', predicate: '(:pfriendOf)+', object: '?x1', path: 'Path(http://example.org/gmark/pfriendOf+)'},
            {subject: '?x1', predicate: '(^:pconductor)', object: '?v0'},
            {subject: '?v0', predicate: '(:phomepage)', object: '?v1'},
            {subject: '?v1', predicate: '(^:phomepage)', object: '?x2'}
        ]
        return build_resume_query(projection, triples, state)
    })
    solutions = result_set.solutions()
    console.log(`Number of solutions: ${solutions.length}`)
    return result_set
}

module.exports = { 'run': run }