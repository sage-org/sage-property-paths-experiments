const { eval, build_resume_query } = require('./../engine')
const { ResultSet } = require('./../result-set')

let queries = [
    `PREFIX : <http://example.org/gmark/> 
    SELECT ?x2 ?x3 ?x0 ?x1 
    WHERE { 
        ?x0 ((:phomepage/^:phomepage)|(:phomepage/^:phomepage))+ ?x1 . 
        ?x0 (:partist) ?v0 . ?v0 (:plike) ?x2 . 
        ?x1 (:partist) ?v1 . ?v1 (:pmakesPurchase) ?v2 . ?v2 (:ppurchaseFor) ?x3 .
    }`,
    `PREFIX : <http://example.org/gmark/> 
    SELECT ?x2 ?x3 ?x0 ?x1 
    WHERE { 
        ?x0 ((:phomepage/^:phomepage)|(:phomepage/^:phomepage))+ ?x1 . 
        ?x0 (:partist) ?v0 . ?v0 (:plike) ?x2 .  
        ?x1 (:partist) ?v1 . ?v1 (^:previewer) ?v2 . ?v2 (^:phasReview) ?x3 .
    }`
]

async function run(client, graph) {
    let result_set = new ResultSet()
    result_set.bgp = 1
    await eval(queries[0], client, graph, result_set, (state) => {
        let projection = '?x0'
        let triples = [
            {subject: '?x0', predicate: '((:phomepage/^:phomepage)|(:phomepage/^:phomepage))+', object: '?x1', path: 'Path(Path(Path(http://example.org/gmark/phomepage / Path(~http://example.org/gmark/phomepage)) | Path(http://example.org/gmark/phomepage / Path(~http://example.org/gmark/phomepage)))+)'},
            {subject: '?x0', predicate: '(:partist)', object: '?v0'},
            {subject: '?v0', predicate: '(:plike)', object: '?x2'},
            {subject: '?x1', predicate: '(:partist)', object: '?v1'},
            {subject: '?v1', predicate: '(:pmakesPurchase)', object: '?v2'},
            {subject: '?v2', predicate: '(:ppurchaseFor)', object: '?x3'}
        ]
        return build_resume_query(projection, triples, state)
    })
    result_set.bgp = 2
    await eval(queries[1], client, graph, result_set, (state) => {
        let projection = '?x0'
        let triples = [
            {subject: '?x0', predicate: '((:phomepage/^:phomepage)|(:phomepage/^:phomepage))+', object: '?x1', path: 'Path(Path(Path(http://example.org/gmark/phomepage / Path(~http://example.org/gmark/phomepage)) | Path(http://example.org/gmark/phomepage / Path(~http://example.org/gmark/phomepage)))+)'},
            {subject: '?x0', predicate: '(:partist)', object: '?v0'},
            {subject: '?v0', predicate: '(:plike)', object: '?x2'},
            {subject: '?x1', predicate: '(:partist)', object: '?v1'},
            {subject: '?v1', predicate: '(^:previewer)', object: '?v2'},
            {subject: '?v2', predicate: '(^:phasReview)', object: '?x3'}
        ]
        return build_resume_query(projection, triples, state)
    })
    let solutions = result_set.solutions() 
    console.log(`Number of solutions: ${solutions.length}`)
}

module.exports = { 'run': run }