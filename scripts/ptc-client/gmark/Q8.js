const { eval, build_resume_query } = require('./../engine')
const { ResultSet } = require('./../result-set')

let queries = [
    `PREFIX : <http://example.org/gmark/> 
    SELECT ?x0
    WHERE { 
        ?x0 (:peditor) ?v0 . ?v0 (:plike) ?v1 . ?v1 (:phasReview) ?x1 . 
        ?x1 (^:phasReview) ?v2 . ?v2 (:partist) ?x2 .  
        ?x2 (:pfriendOf)+ ?x3 . 
    }`
]

async function run(client, graph) {
    let result_set = new ResultSet()
    await eval(queries[0], client, graph, result_set, (state) => {
        let projection = '?x0'
        let triples = [
            {subject: '?x0', predicate: '(:peditor)', object: '?v0'},
            {subject: '?v0', predicate: '(:plike)', object: '?v1'},
            {subject: '?v1', predicate: '(:phasReview)', object: '?x1'},
            {subject: '?x1', predicate: '(^:phasReview)', object: '?v2'},
            {subject: '?v2', predicate: '(:partist)', object: '?x2'},
            {subject: '?x2', predicate: '(:pfriendOf)+', object: '?x3', path: 'Path(http://example.org/gmark/pfriendOf+)'}
        ]
        return build_resume_query(projection, triples, state)
    })
    let solutions = result_set.solutions()
    console.log(`Number of solutions: ${solutions.length}`)
    return result_set
}

module.exports = { 'run': run }