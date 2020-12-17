const { eval, build_resume_query } = require('./../engine')
const { ResultSet } = require('./../result-set')

let queries = [
    `PREFIX : <http://example.org/gmark/> 
    SELECT ?x0 ?x3
    WHERE { 
        ?x0 (^:pmakesPurchase) ?v0 . ?v0 (:pfollows) ?x1 . 
        ?x1 (^:partist) ?v1 . ?v1 (^:ppurchaseFor) ?x2 . 
        ?x2 ((:ppurchaseFor/^:ppurchaseFor))+ ?x3 .
    }`,
    `PREFIX : <http://example.org/gmark/> 
    SELECT ?x0 ?x3
    WHERE { 
        ?x0 (^:pmakesPurchase) ?v0 . ?v0 (:pfollows) ?x1 . 
        ?x1 (^:peditor) ?v1 . ?v1 (^:plike) ?v2 . ?v2 (:pmakesPurchase) ?x2 . 
        ?x2 ((:ppurchaseFor/^:ppurchaseFor))+ ?x3 .
    }`
]

async function run(client, graph) {
    let result_set = new ResultSet()
    result_set.bgp = 1
    await eval(queries[0], client, graph, result_set, (state) => {
        let projection = '?x0'
        let triples = [
            {subject: '?x0', predicate: '(^:pmakesPurchase)', object: '?v0'},
            {subject: '?v0', predicate: '(:pfollows)', object: '?x1'},
            {subject: '?x1', predicate: '(^:partist)', object: '?v1'},
            {subject: '?v1', predicate: '(^:ppurchaseFor)', object: '?x2'},
            {subject: '?x2', predicate: '((:ppurchaseFor/^:ppurchaseFor))+', object: '?x3', path: 'Path(Path(http://example.org/gmark/ppurchaseFor / Path(~http://example.org/gmark/ppurchaseFor))+)'}
        ]
        return build_resume_query(projection, triples, state)
    })
    result_set.bgp = 2
    await eval(queries[1], client, graph, result_set, (state) => {
        let projection = '?x0'
        let triples = [
            {subject: '?x0', predicate: '(^:pmakesPurchase)', object: '?v0'},
            {subject: '?v0', predicate: '(:pfollows)', object: '?x1'},
            {subject: '?x1', predicate: '(^:peditor)', object: '?v1'},
            {subject: '?v1', predicate: '(^:plike)', object: '?v2'},
            {subject: '?v2', predicate: '(:pmakesPurchase)', object: '?x2'},
            {subject: '?x2', predicate: '((:ppurchaseFor/^:ppurchaseFor))+', object: '?x3', path: 'Path(Path(http://example.org/gmark/ppurchaseFor / Path(~http://example.org/gmark/ppurchaseFor))+)'}
        ]
        return build_resume_query(projection, triples, state)
    })
    let solutions = result_set.solutions() 
    console.log(`Number of solutions: ${solutions.length}`)
}

module.exports = { 'run': run }