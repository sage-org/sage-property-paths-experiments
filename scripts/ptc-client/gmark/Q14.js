const { eval, build_resume_query } = require('./../engine')
const { ResultSet } = require('./../result-set')

let queries = [
    `PREFIX : <http://example.org/gmark/> 
    SELECT ?x0 ?x3 
    WHERE {   
        ?x0 ((:previewer/^:pauthor/:phasReview))+ ?x1 . 
        ?x0 (:previewer) ?v0 . ?v0 (^:pdirector) ?x3 . 
        ?x0 (:previewer)+ ?x2 . 
    }`
]

async function run(client, graph) {
    let result_set = new ResultSet()
    await eval(queries[0], client, graph, result_set, (state) => {
        let projection = '?x0 ?x3'
        let triples = [
            {subject: '?x0', predicate: '(:previewer/^:pauthor/:phasReview)+', object: '?x1', path: 'Path(Path(http://example.org/gmark/previewer / Path(~http://example.org/gmark/pauthor) / http://example.org/gmark/phasReview)+)'},
            {subject: '?x0', predicate: '(:previewer)', object: '?v0'},
            {subject: '?v0', predicate: '(^:pdirector)', object: '?x3'},
            {subject: '?x0', predicate: '(:previewer)+', object: '?x2'}
        ]
        return build_resume_query(projection, triples, state)
    })
    let solutions = result_set.solutions()
    console.log(`Number of solutions: ${solutions.length}`)
}

module.exports = { 'run': run }