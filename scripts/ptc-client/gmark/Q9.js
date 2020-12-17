const { eval, build_resume_query } = require('./../engine')
const { ResultSet } = require('./../result-set')

let queries = [
    `PREFIX : <http://example.org/gmark/> 
    SELECT ?x0 
    WHERE { 
        BIND(STR("1") AS ?bgp)
        ?x0 (^:pexpires) ?x1 . 
        ?x1 (:pauthor) ?v0 . ?v0 (^:peditor) ?x2 . 
        ?x2 ((:peditor/^:pauthor))+ ?x3 .
        ?x3 (^:pincludes) ?v1 . ?v1 (:pincludes) ?x4 . 
    }`,
    `PREFIX : <http://example.org/gmark/> 
    SELECT ?x0 
    WHERE { 
        BIND(STR("2") AS ?bgp)
        ?x0 (^:pexpires) ?x1 . 
        ?x1 (:pauthor) ?v0 . ?v0 (^:peditor) ?x2 .
        ?x2 ((:peditor/^:pauthor))+ ?x3 . 
        ?x3 (^:ppurchaseFor) ?v1 . ?v1 (^:pmakesPurchase) ?v2 . ?v2 (^:peditor) ?x4 . 
    }`
]

async function run(client, graph) {
    let result_set = new ResultSet()
    await eval(queries[0], client, graph, result_set, (state) => {
        let projection = '?x0'
        let triples = [
            {subject: '?x0', predicate: '(^:pexpires)', object: '?x1'},
            {subject: '?x1', predicate: '(:pauthor)', object: '?v0'},
            {subject: '?v0', predicate: '(^:peditor)', object: '?x2'},
            {subject: '?x2', predicate: '(:peditor/^:pauthor)+', object: '?x3', path: 'Path(Path(http://example.org/gmark/peditor / Path(~http://example.org/gmark/pauthor))+)'},
            {subject: '?x3', predicate: '(^:pincludes)', object: '?v1'},
            {subject: '?v1', predicate: '(:pincludes)', object: '?x4'}
        ]
        return build_resume_query(projection, triples, state)
    })
    await eval(queries[1], client, graph, result_set, (state) => {
        let projection = '?x0'
        let triples = [
            {subject: '?x0', predicate: '(^:pexpires)', object: '?x1'},
            {subject: '?x1', predicate: '(:pauthor)', object: '?v0'},
            {subject: '?v0', predicate: '(^:peditor)', object: '?x2'},
            {subject: '?x2', predicate: '((:peditor/^:pauthor))+', object: '?x3', path: 'Path(Path(http://example.org/gmark/peditor / Path(~http://example.org/gmark/pauthor))+)'},
            {subject: '?x3', predicate: '(^:ppurchaseFor)', object: '?v1'},
            {subject: '?v1', predicate: '(^:pmakesPurchase)', object: '?v2'},
            {subject: '?v2', predicate: '(^:peditor)', object: '?x4'}
        ]
        return build_resume_query(projection, triples, state)
    })
    let solutions = result_set.solutions() 
    console.log(`Number of solutions: ${solutions.length}`)
}

module.exports = { 'run': run }