const { eval, build_resume_query } = require('./../engine')
const { ResultSet } = require('./../result-set')

let queries = [
    `PREFIX : <http://example.org/gmark/> 
    SELECT ?x1 ?x3 ?x2 ?x0 
    WHERE { 
        ?x0 (^:peditor) ?v0 . ?v0 (:peditor) ?v1 . ?v1 (^:pfriendOf) ?x1 . 
        ?x0 (:plike) ?v2 . ?v2 (^:plike) ?v3 . ?v3 (^:previewer) ?v4 . ?v4 (:previewer) ?x2 . 
        ?x1 ((:pfriendOf)|(^:peditor/:phomepage/^:phomepage))+ ?x3 .
    }`
]

async function run(client, graph) {
    let result_set = new ResultSet()
    await eval(queries[0], client, graph, result_set, (state) => {
        let projection = '?x1 ?x3 ?x2 ?x0'
        let triples = [
            {subject: '?x0', predicate: '(^:peditor)', object: '?v0'},
            {subject: '?v0', predicate: '(:peditor)', object: '?v1'},
            {subject: '?v1', predicate: '(^:pfriendOf)', object: '?x1'},
            {subject: '?x0', predicate: '(:plike)', object: '?v2'},
            {subject: '?v2', predicate: '(^:plike)', object: '?v3'},
            {subject: '?v3', predicate: '(^:previewer)', object: '?v4'},
            {subject: '?v4', predicate: '(:previewer)', object: '?x2'},
            {subject: '?x1', predicate: '((:pfriendOf)|(^:peditor/:phomepage/^:phomepage))+', object: '?x3', path: 'Path(Path(http://example.org/gmark/pfriendOf | Path(Path(~http://example.org/gmark/peditor) / http://example.org/gmark/phomepage / Path(~http://example.org/gmark/phomepage)))+)'}
        ]
        return build_resume_query(projection, triples, state)
    })
    let solutions = result_set.solutions()
    console.log(`Number of solutions: ${solutions.length}`)
}

module.exports = { 'run': run }