const { eval, build_resume_query } = require('./../engine')
const { ResultSet } = require('./../result-set')

let queries = [
    `PREFIX : <http://example.org/gmark/> 
    SELECT ?x0 
    WHERE { 
        ?x0 (^:pmakesPurchase) ?v0 . ?v0 (:plike) ?x1 . 
        ?x1 ((:phomepage/^:phomepage))+ ?x2 . 
        ?x2 (:pactor) ?v1 . ?v1 (:plike) ?v2 . ?v2 (:pconductor) ?x3 . 
        ?x3 ((:pfriendOf))+ ?x4 .  
    }`
]

async function run(client, graph) {
    let result_set = new ResultSet()
    await eval(queries[0], client, graph, result_set, (state) => {
        let projection = '?x0' 
        let triples = [
            {subject: '?x0', predicate: '(^:pmakesPurchase)', object: '?v0'},
            {subject: '?v0', predicate: '(:plike)', object: '?x1'},
            {subject: '?x1', predicate: '((:phomepage/^:phomepage))+', object: '?x2', path: 'Path(Path(http://example.org/gmark/phomepage / Path(~http://example.org/gmark/phomepage))+)'},
            {subject: '?x2', predicate: '(:pactor)', object: '?v1'},
            {subject: '?v1', predicate: '(:plike)', object: '?v2'},
            {subject: '?v2', predicate: '(:pconductor)', object: '?x3'},
            {subject: '?x3', predicate: '((:pfriendOf))+', object: '?x4', path: 'Path(http://example.org/gmark/pfriendOf+)'}
        ]
        return build_resume_query(projection, triples, state)
    })
    solutions = result_set.solutions()
    console.log(`Number of solutions: ${solutions.length}`)
}

module.exports = { 'run': run }