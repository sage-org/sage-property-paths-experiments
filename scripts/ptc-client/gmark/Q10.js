const { eval, build_resume_query } = require('./../engine')
const { ResultSet } = require('./../result-set')

let queries = [
    `PREFIX : <http://example.org/gmark/> 
    SELECT ?x0 
    WHERE { 
        ?x0 ((:previewer/^:pactor/:phasReview))+ ?x1 . 
        ?x1 ((^:phasReview/:pauthor/^:previewer))+ ?x2 . 
        ?x2 (:previewer) ?v0 . ?v0 (:pfriendOf) ?v1 . ?v1 (:plike) ?x3 .    
    }`
]

async function run(client, graph) {
    let result_set = new ResultSet()
    await eval(queries[0], client, graph, result_set, (state) => {
        let projection = '?x0' 
        let triples = [
            {subject: '?x0', predicate: '((:previewer/^:pactor/:phasReview))+', object: '?x1', path: 'Path(Path(http://example.org/gmark/previewer / Path(~http://example.org/gmark/pactor) / http://example.org/gmark/phasReview)+)'},
            {subject: '?x1', predicate: '((^:phasReview/:pauthor/^:previewer))+', object: '?x2', path: 'Path(Path(Path(~http://example.org/gmark/phasReview) / http://example.org/gmark/pauthor / Path(~http://example.org/gmark/previewer))+)'},
            {subject: '?x2', predicate: '(:previewer)', object: '?v0'},
            {subject: '?v0', predicate: '(:pfriendOf)', object: '?v1'},
            {subject: '?v1', predicate: '(:plike)', object: '?x3'}
        ]
        return build_resume_query(projection, triples, state)
    })
    solutions = result_set.solutions()
    console.log(`Number of solutions: ${solutions.length}`)
}

module.exports = { 'run': run }