const { eval, build_resume_query } = require('../engine')
const { ResultSet } = require('../result-set')

let queries = [
    `PREFIX : <http://example.org/gmark/> 
    SELECT ?x2
    WHERE { 
        BIND(IRI("http://example.org/gmark/User_8706850") AS ?x2)
        ?x0 (:plike) ?v0 . ?v0 (^:plike) ?x1 . 
        ?x1 ((:pfriendOf/^:pfriendOf)|(^:pauthor/:pauthor))+ ?x2 .  
    }`
]

async function run(client, graph) {
    let result_set = new ResultSet()
    await eval(queries[0], client, graph, result_set, (state) => {
        let projection = '?x0' 
        let triples = [
            {subject: '?x0', predicate: '(:plike)', object: '?v0'},
            {subject: '?v0', predicate: '(^:plike)', object: '?x1'},
            {subject: '?x1', predicate: '((:pfriendOf/^:pfriendOf)|(^:pauthor/:pauthor))+', object: '?x2', path: 'Path(Path(Path(http://example.org/gmark/pfriendOf / Path(~http://example.org/gmark/pfriendOf)) | Path(Path(~http://example.org/gmark/pauthor) / http://example.org/gmark/pauthor))+)'}
        ]
        return build_resume_query(projection, triples, state)
    })
    solutions = result_set.solutions()
    console.log(`Number of solutions: ${solutions.length}`)
    return result_set
}

module.exports = { 'run': run }