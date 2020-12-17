const { eval, build_resume_query } = require('./../engine')
const { ResultSet } = require('./../result-set')

let queries = [
    `PREFIX : <http://example.org/gmark/> 
    SELECT ?x3 ?x0 ?x1 ?x2  
    WHERE { 
        ?x0 (:pmakesPurchase) ?v0 . ?v0 (:ppurchaseFor) ?v1 . ?v1 (:peditor) ?x1 . 
        ?x0 ((^:pfriendOf|:pfriendOf))+ ?x2 . 
        ?x0 (^:pconductor) ?v2 . ?v2 (:pconductor) ?x3 .
    }`
]

async function run(client, graph) {
    let result_set = new ResultSet()
    await eval(queries[0], client, graph, result_set, (state) => {
        let projection = '?x3 ?x0 ?x1 ?x2'
        let triples = [
            {subject: '?x0', predicate: '(:pmakesPurchase)', object: '?v0'},
            {subject: '?v0', predicate: '(:ppurchaseFor)', object: '?v1'},
            {subject: '?v1', predicate: '(:peditor)', object: '?x1'},
            {subject: '?x0', predicate: '((^:pfriendOf|:pfriendOf))+', object: '?x2', path: 'Path(Path(Path(~http://example.org/gmark/pfriendOf) | http://example.org/gmark/pfriendOf)+)'},
            {subject: '?x0', predicate: '(^:pconductor)', object: '?v2'},
            {subject: '?v2', predicate: '(:pconductor)', object: '?x3'}
        ]
        return build_resume_query(projection, triples, state)
    })
    let solutions = result_set.solutions()
    console.log(`Number of solutions: ${solutions.length}`)
}

module.exports = { 'run': run }