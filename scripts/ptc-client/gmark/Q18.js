const { eval, build_resume_query } = require('./../engine')
const { ResultSet } = require('./../result-set')

let queries = [
    `PREFIX : <http://example.org/gmark/> 
    SELECT ?x0 ?x1 ?x2 ?x3
    WHERE { 
        ?x0 ((:phomepage/^:phomepage))+ ?x1 . 
        ?x1 ((:phomepage/^:phomepage)|(:phomepage/^:phomepage))+ ?x2 . 
        ?x2 (:phasGenre) ?v0 . ?v0 (^:phasGenre) ?x3 .  
    }`
]

async function run(client, graph) {
    let result_set = new ResultSet()
    await eval(queries[0], client, graph, result_set, (state) => {
        let projection = '?x0 ?x1 ?x2 ?x3'
        let triples = [
            {subject: '?x0', predicate: '((:phomepage/^:phomepage))+', object: '?x1', path: 'Path(Path(http://example.org/gmark/phomepage / Path(~http://example.org/gmark/phomepage))+)'},
            {subject: '?x1', predicate: '((:phomepage/^:phomepage)|(:phomepage/^:phomepage))+', object: '?x2', path: 'Path(Path(Path(http://example.org/gmark/phomepage / Path(~http://example.org/gmark/phomepage)) | Path(http://example.org/gmark/phomepage / Path(~http://example.org/gmark/phomepage)))+)'},
            {subject: '?x2', predicate: '(:phasGenre)', object: '?v0'},
            {subject: '?v0', predicate: '(^:phasGenre)', object: '?x3'}
        ]
        return build_resume_query(projection, triples, state)
    })
    let solutions = result_set.solutions()
    console.log(`Number of solutions: ${solutions.length}`)
}

module.exports = { 'run': run }