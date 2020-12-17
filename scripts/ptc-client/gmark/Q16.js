const { eval, build_resume_query } = require('./../engine')
const { ResultSet } = require('./../result-set')

let queries = [
    `PREFIX : <http://example.org/gmark/> 
    SELECT ?x1 ?x0 ?x2  
    WHERE { 
        ?x0 ((^:pincludes/:pincludes)|(:pconductor/^:pconductor))+ ?x1 . 
        ?x0 ((:phomepage/^:phomepage)|(^:ppurchaseFor/^:pmakesPurchase/^:pconductor))+ ?x2 .   
    }`
]

async function run(client, graph) {
    let result_set = new ResultSet()
    await eval(queries[0], client, graph, result_set, (state) => {
        let projection = '?x1 ?x0 ?x2 ' 
        let triples = [
            {subject: '?x0', predicate: '((^:pincludes/:pincludes)|(:pconductor/^:pconductor))+', object: '?x1', path: 'Path(Path(Path(Path(~http://example.org/gmark/pincludes) / http://example.org/gmark/pincludes) | Path(http://example.org/gmark/pconductor / Path(~http://example.org/gmark/pconductor)))+)'},
            {subject: '?x0', predicate: '((:phomepage/^:phomepage)|(^:ppurchaseFor/^:pmakesPurchase/^:pconductor))+', object: '?x2', path: 'Path(Path(Path(http://example.org/gmark/phomepage / Path(~http://example.org/gmark/phomepage)) | Path(Path(~http://example.org/gmark/ppurchaseFor) / Path(~http://example.org/gmark/pmakesPurchase) / Path(~http://example.org/gmark/pconductor)))+)'}
        ]
        return build_resume_query(projection, triples, state)
    })
    solutions = result_set.solutions()
    console.log(`Number of solutions: ${solutions.length}`)
    return result_set
}

module.exports = { 'run': run }