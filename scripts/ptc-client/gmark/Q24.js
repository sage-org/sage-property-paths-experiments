const { eval, build_resume_query } = require('./../engine')
const { ResultSet } = require('./../result-set')

let queries = [
    `PREFIX : <http://example.org/gmark/> 
    SELECT ?x0 ?x1 ?x2
    WHERE { 
        ?x0 ((:previewer/:pfriendOf/^:previewer))+ ?x1 . 
        ?x0 ((:previewer/:pfriendOf/^:previewer))+ ?x2 . 
        ?x0 ((^:phasReview/:peditor/^:previewer))+ ?x3 .
    }`
]

async function run(client, graph) {
    let result_set = new ResultSet()
    await eval(queries[0], client, graph, result_set, (state) => {
        let projection = '?x0 ?x1 ?x2'
        let triples = [
            {subject: '?x0', predicate: '((:previewer/:pfriendOf/^:previewer))+', object: '?x1', path: 'Path(Path(http://example.org/gmark/previewer / http://example.org/gmark/pfriendOf / Path(~http://example.org/gmark/previewer))+)'},
            {subject: '?x0', predicate: '((:previewer/:pfriendOf/^:previewer))+', object: '?x2', path: 'Path(Path(http://example.org/gmark/previewer / http://example.org/gmark/pfriendOf / Path(~http://example.org/gmark/previewer))+)'},
            {subject: '?x0', predicate: '((^:phasReview/:peditor/^:previewer))+', object: '?x3', path: 'Path(Path(Path(~http://example.org/gmark/phasReview) / http://example.org/gmark/peditor / Path(~http://example.org/gmark/previewer))+)'}
        ]
        return build_resume_query(projection, triples, state)
    })
    let solutions = result_set.solutions()
    console.log(`Number of solutions: ${solutions.length}`)
}

module.exports = { 'run': run }