const { eval, build_resume_query } = require('./../engine')
const { ResultSet } = require('./../result-set')

let queries = [
    `PREFIX : <http://example.org/gmark/> 
    SELECT ?x0 ?x3
    WHERE { 
        ?x0 (^:pdirector) ?v0 . ?v0 (^:ppurchaseFor) ?v1 . ?v1 (^:pmakesPurchase) ?x1 . 
        ?x1 (^:pactor) ?v2 . ?v2 (:pactor) ?x2 . 
        ?x2 ((^:pactor/:pdirector)|(^:pfriendOf))+ ?x3 .
    }`
]

async function run(client, graph) {
    let result_set = new ResultSet()
    await eval(queries[0], client, graph, result_set, (state) => {
        let projection = '?x0 ?x3'
        let triples = [
            {subject: '?x0', predicate: '(^:pdirector)', object: '?v0'},
            {subject: '?v0', predicate: '(^:ppurchaseFor)', object: '?v1'},
            {subject: '?v1', predicate: '(^:pmakesPurchase)', object: '?x1'},
            {subject: '?x1', predicate: '(^:pactor)', object: '?v2'},
            {subject: '?v2', predicate: '(:pactor)', object: '?x2'},
            {subject: '?x2', predicate: '((^:pactor/:pdirector)|(^:pfriendOf))+', object: '?x3', path: 'Path(Path(Path(Path(~http://example.org/gmark/pactor) / http://example.org/gmark/pdirector) | Path(~http://example.org/gmark/pfriendOf))+)'}
        ]
        return build_resume_query(projection, triples, state)
    })
    let solutions = result_set.solutions()
    console.log(`Number of solutions: ${solutions.length}`)
}

module.exports = { 'run': run }