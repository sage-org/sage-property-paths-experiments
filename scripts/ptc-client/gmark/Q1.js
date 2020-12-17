const { eval, build_resume_query } = require('./../engine')
const { ResultSet } = require('./../result-set')

let queries = [
    `PREFIX : <http://example.org/gmark/> 
    SELECT ?x2
    WHERE { 
        BIND(IRI("http://example.org/gmark/Book_301555") AS ?x0)
        ?x0 ((^:plike/:plike))+ ?x1 . 
        ?x1 (:peditor) ?v0 . ?v0 (:pfollows) ?v1 . ?v1(:plike) ?x2
    }`
]

async function run(client, graph) {
    let result_set = new ResultSet()
    await eval(queries[0], client, graph, result_set, (state) => {
        let projection = '?x0' 
        let triples = [
            {subject: '?x0', predicate: '((^:plike/:plike))+', object: '?x1', path: 'Path(Path(Path(~http://example.org/gmark/plike) / http://example.org/gmark/plike)+)'},
            {subject: '?x1', predicate: '(:peditor)', object: '?v0'},
            {subject: '?v0', predicate: '(:pfollows)', object: '?v1'},
            {subject: '?v1', predicate: '(:plike)', object: '?x2'}
        ]
        return build_resume_query(projection, triples, state)
    })
    solutions = result_set.solutions()
    console.log(`Number of solutions: ${solutions.length}`)
    return result_set
}

module.exports = { 'run': run }