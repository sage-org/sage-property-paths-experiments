const { eval, build_resume_query } = require('./../engine')
const { ResultSet } = require('./../result-set')

let queries = [
    `PREFIX : <http://example.org/gmark/> 
    SELECT ?x0 ?x1
    WHERE { 
        ?x0 ((:psubscribes/^:phomepage/:peditor)|(^:pdirector/:ptrailer/^:phomepage))+ ?x1 . 
        ?x0 ((:pfriendOf)|(^:peditor/:phomepage/^:psubscribes))+ ?x2 . 
        ?x0 (:pfriendOf)+ ?x3 . 
        ?x0 (^:pfriendOf)+ ?x4 .  
    }`
]

async function run(client, graph) {
    let result_set = new ResultSet()
    await eval(queries[0], client, graph, result_set, (state) => {
        let projection = '?x0 ?x1'
        let triples = [
            {subject: '?x0', predicate: '((:psubscribes/^:phomepage/:peditor)|(^:pdirector/:ptrailer/^:phomepage))+', object: '?x1', path: 'Path(Path(Path(http://example.org/gmark/psubscribes / Path(~http://example.org/gmark/phomepage) / http://example.org/gmark/peditor) | Path(Path(~http://example.org/gmark/pdirector) / http://example.org/gmark/ptrailer / Path(~http://example.org/gmark/phomepage)))+)'},
            {subject: '?x0', predicate: '((:pfriendOf)|(^:peditor/:phomepage/^:psubscribes))+', object: '?x2', path: 'Path(Path(http://example.org/gmark/pfriendOf | Path(Path(~http://example.org/gmark/peditor) / http://example.org/gmark/phomepage / Path(~http://example.org/gmark/psubscribes)))+)'},
            {subject: '?x0', predicate: '(:pfriendOf)+', object: '?x3', path: 'Path(http://example.org/gmark/pfriendOf+)'},
            {subject: '?x0', predicate: '(^:pfriendOf)+', object: '?x4', path: 'Path(Path(~http://example.org/gmark/pfriendOf)+)'}
        ]
        return build_resume_query(projection, triples, state)
    })
    let solutions = result_set.solutions()
    console.log(`Number of solutions: ${solutions.length}`)
    return result_set
}

module.exports = { 'run': run }