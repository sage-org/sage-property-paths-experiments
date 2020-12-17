const { eval, build_resume_query } = require('./../engine')
const { ResultSet } = require('./../result-set')

let queries = [
    `PREFIX : <http://example.org/gmark/> 
    SELECT ?x0 
    WHERE { 
        ?x0 (^:plike) ?v0 . ?v0 (^:pconductor) ?v1 . ?v1 (^:pincludes) ?x1 . 
        ?x1 ((:pincludes/^:pincludes)|(:pincludes/^:pincludes))+ ?x2 . 
        ?x2 (:pincludes) ?v2 . ?v2 (:pauthor) ?v3 . ?v3 (^:partist) ?x3 .  
    }`,
    `PREFIX : <http://example.org/gmark/> 
    SELECT ?x0 
    WHERE { 
        ?x0 (^:plike) ?v0 . ?v0 (^:pconductor) ?v1 . ?v1 (^:pincludes) ?x1 .
        ?x1 (((:pincludes/^:pincludes)|(:pincludes/^:pincludes)))+ ?x2 . 
        ?x2 (:pincludes) ?v2 . ?v2 (:pauthor) ?v3 . ?v3 (^:partist) ?x3 .  
    }`
]

async function run(client, graph) {
    let result_set = new ResultSet()
    result_set.bgp = 1
    await eval(queries[0], client, graph, result_set, (state) => {
        let projection = '?x0'
        let triples = [
            {subject: '?x0', predicate: '(^:plike)', object: '?v0'},
            {subject: '?v0', predicate: '(^:pconductor)', object: '?v1'},
            {subject: '?v1', predicate: '(^:pincludes)', object: '?x1'},

            {subject: '?x1', predicate: '((:pincludes/^:pincludes)|(:pincludes/^:pincludes))+', object: '?x2', path: 'Path(Path(Path(http://example.org/gmark/pincludes / Path(~http://example.org/gmark/pincludes)) | Path(http://example.org/gmark/pincludes / Path(~http://example.org/gmark/pincludes)))+)'},

            {subject: '?x2', predicate: '(:pincludes)', object: '?v2'},
            {subject: '?v2', predicate: '(:pauthor)', object: '?v3'},
            {subject: '?v3', predicate: '(^:partist)', object: '?x3'}
        ]
        return build_resume_query(projection, triples, state)
    })
    result_set.bgp = 2
    await eval(queries[1], client, graph, result_set, (state) => {
        let projection = '?x0'
        let triples = [
            {subject: '?x0', predicate: '(^:plike)', object: '?v0'},
            {subject: '?v0', predicate: '(^:pconductor)', object: '?v1'},
            {subject: '?v1', predicate: '(^:pincludes)', object: '?x1'},

            {subject: '?x1', predicate: '((:pincludes/^:pincludes)|(:pincludes/^:pincludes))+', object: '?x2', path: 'Path(Path(Path(http://example.org/gmark/pincludes / Path(~http://example.org/gmark/pincludes)) | Path(http://example.org/gmark/pincludes / Path(~http://example.org/gmark/pincludes)))+)'},

            {subject: '?x2', predicate: '(:pincludes)', object: '?v2'},
            {subject: '?v2', predicate: '(:pauthor)', object: '?v3'},
            {subject: '?v3', predicate: '(^:partist)', object: '?x3'}
        ]
        return build_resume_query(projection, triples, state)
    })
    let solutions = result_set.solutions() 
    console.log(`Number of solutions: ${solutions.length}`)
}

module.exports = { 'run': run }