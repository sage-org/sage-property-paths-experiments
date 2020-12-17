const { eval, build_resume_query } = require('./../engine')
const { ResultSet } = require('./../result-set')

let queries = [
    `PREFIX : <http://example.org/gmark/> 
    SELECT ?x0 
    WHERE { 
        ?x0 ((:pauthor/:psubscribes/^:phomepage)|(:peditor/^:pfriendOf/^:pauthor))+ ?x1 . 
        ?x0 (:pauthor) ?v0 . ?v0 (^:previewer) ?v1 . ?v1 (^:phasReview) ?x2 . 
        ?x0 (:phasReview) ?v2 . ?v2 (:previewer) ?v3 . ?v3 (^:pauthor) ?x3 .  
    }`,
    `PREFIX : <http://example.org/gmark/> 
    SELECT ?x0 
    WHERE { 
        ?x0 ((:pauthor/:psubscribes/^:phomepage)|(:peditor/^:pfriendOf/^:pauthor))+ ?x1 . 
        ?x0 (:pauthor) ?v0 . ?v0 (^:previewer) ?v1 . ?v1 (^:phasReview) ?x2 . 
        ?x0 (^:ppurchaseFor) ?v2 . ?v2 (^:pmakesPurchase) ?v3 . ?v3 (^:pauthor) ?x3 .  
    }`
]

async function run(client, graph) {
    let result_set = new ResultSet()
    result_set.bgp = 1
    await eval(queries[0], client, graph, result_set, (state) => {
        let projection = '?x0'
        let triples = [
            {subject: '?x0', predicate: '((:pauthor/:psubscribes/^:phomepage)|(:peditor/^:pfriendOf/^:pauthor))+', object: '?x1', path: 'Path(Path(Path(http://example.org/gmark/pauthor / http://example.org/gmark/psubscribes / Path(~http://example.org/gmark/phomepage)) | Path(http://example.org/gmark/peditor / Path(~http://example.org/gmark/pfriendOf) / Path(~http://example.org/gmark/pauthor)))+)'},
            {subject: '?x0', predicate: '(:pauthor)', object: '?v0'},
            {subject: '?v0', predicate: '(^:previewer)', object: '?v1'},
            {subject: '?v1', predicate: '(^:phasReview)', object: '?x2'},
            {subject: '?x0', predicate: '(:phasReview)', object: '?v2'},
            {subject: '?v2', predicate: '(:previewer)', object: '?v3'},
            {subject: '?v3', predicate: '(^:pauthor)', object: '?x3'}
        ]
        return build_resume_query(projection, triples, state)
    })
    result_set.bgp = 2
    await eval(queries[1], client, graph, result_set, (state) => {
        let projection = '?x0'
        let triples = [
            {subject: '?x0', predicate: '((:pauthor/:psubscribes/^:phomepage)|(:peditor/^:pfriendOf/^:pauthor))+', object: '?x1', path: 'Path(Path(Path(http://example.org/gmark/pauthor / http://example.org/gmark/psubscribes / Path(~http://example.org/gmark/phomepage)) | Path(http://example.org/gmark/peditor / Path(~http://example.org/gmark/pfriendOf) / Path(~http://example.org/gmark/pauthor)))+)'},
            {subject: '?x0', predicate: '(:pauthor)', object: '?v0'},
            {subject: '?v0', predicate: '(^:previewer)', object: '?v1'},
            {subject: '?v1', predicate: '(^:phasReview)', object: '?x2'},
            {subject: '?x0', predicate: '(^:ppurchaseFor)', object: '?v2'},
            {subject: '?v2', predicate: '(^:pmakesPurchase)', object: '?v3'},
            {subject: '?v3', predicate: '(^:pauthor)', object: '?x3'}
        ]
        return build_resume_query(projection, triples, state)
    })
    let solutions = result_set.solutions() 
    console.log(`Number of solutions: ${solutions.length}`)
}

module.exports = { 'run': run }