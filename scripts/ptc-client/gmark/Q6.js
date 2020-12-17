const { eval, build_resume_query } = require('./../engine')
const { ResultSet } = require('./../result-set')

let queries = [
    `PREFIX : <http://example.org/gmark/> 
    SELECT ?x1 ?x0 ?x2  
    WHERE { 
        ?x0 ((^:pmakesPurchase/^:pdirector/^:ppurchaseFor)|(:ppurchaseFor/:pdirector/:pmakesPurchase))+ ?x1 . 
        ?x0 ((:ppurchaseFor/^:ppurchaseFor))+ ?x2 .  
    }`
]

async function run(client, graph) {
    let result_set = new ResultSet()
    await eval(queries[0], client, graph, result_set, (state) => {
        let projection = '?x1 ?x0 ?x2 ' 
        let triples = [
            {subject: '?x0', predicate: '((^:pmakesPurchase/^:pdirector/^:ppurchaseFor)|(:ppurchaseFor/:pdirector/:pmakesPurchase))+', object: '?x1', path: 'Path(Path(Path(Path(~http://example.org/gmark/pmakesPurchase) / Path(~http://example.org/gmark/pdirector) / Path(~http://example.org/gmark/ppurchaseFor)) | Path(http://example.org/gmark/ppurchaseFor / http://example.org/gmark/pdirector / http://example.org/gmark/pmakesPurchase))+)'},
            {subject: '?x0', predicate: '((:ppurchaseFor/^:ppurchaseFor))+', object: '?x2', path: 'Path(Path(http://example.org/gmark/ppurchaseFor / Path(~http://example.org/gmark/ppurchaseFor))+)'}
        ]
        return build_resume_query(projection, triples, state)
    })
    solutions = result_set.solutions()
    console.log(`Number of solutions: ${solutions.length}`)
    return result_set
}

module.exports = { 'run': run }