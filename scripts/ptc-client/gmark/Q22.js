const { eval, build_resume_query } = require('./../engine')
const { ResultSet } = require('./../result-set')

let queries = [
    `PREFIX : <http://example.org/gmark/> 
    SELECT ?x0 ?x1 
    WHERE { 
        ?x0 (:peditor) ?v0 . ?v0 (^:previewer) ?v1 . ?v1 (^:phasReview) ?x3 . 
        ?x0 (:phomepage/^:phomepage)+ ?x1 . 
        ?x0 (:peditor/^:pfriendOf)+ ?x2 . 
    }`
]

async function run(client, graph) {
    let result_set = new ResultSet()
    await eval(queries[0], client, graph, result_set, (state) => {
        let projection = '?x0 ?x2'
        let triples = [
            {subject: '?x0', predicate: '(:phomepage/^:phomepage)+', object: '?x1', path: 'Path(Path(http://example.org/gmark/phomepage / Path(~http://example.org/gmark/phomepage))+)'},
            {subject: '?x0', predicate: '(:peditor/^:pfriendOf)+', object: '?x2', path: 'Path(Path(http://example.org/gmark/peditor / Path(~http://example.org/gmark/pfriendOf))+)'},
            {subject: '?x0', predicate: '(:peditor)', object: '?v0'},
            {subject: '?v0', predicate: '(^:previewer)', object: '?v1'},
            {subject: '?v1', predicate: '(^:phasReview)', object: '?x3'}
        ]
        return build_resume_query(projection, triples, state)
    })
    let solutions = result_set.solutions()
    console.log(`Number of solutions: ${solutions.length}`)
    return result_set
}

module.exports = { 'run': run }