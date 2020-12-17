const { eval, build_resume_query } = require('../engine')
const { ResultSet } = require('../result-set')

let queries = [
    `PREFIX : <http://example.org/gmark/> 
    SELECT ?x0 ?x1 ?x2
    WHERE { 
        ?x0 ((:pcontactPoint/^:pcontactPoint)|(:pcontactPoint/:pfriendOf/^:pemployee))+ ?x1 . 
        ?x1 (:pemployee) ?v0 . ?v0 (^:previewer) ?v1 . ?v1 (^:phasReview) ?x2 . 
        ?x2 (:pconductor) ?v2 . ?v2 (^:pfriendOf) ?v3 . ?v3 (^:pconductor) ?x3 .
    }`
]

async function run(client, graph) {
    let result_set = new ResultSet()
    await eval(queries[0], client, graph, result_set, (state) => {
        let projection = '?x0' 
        let triples = [
            {subject: '?x0', predicate: '((:pcontactPoint/^:pcontactPoint)|(:pcontactPoint/:pfriendOf/^:pemployee))+', object: '?x1', path: 'Path(Path(Path(http://example.org/gmark/pcontactPoint / Path(~http://example.org/gmark/pcontactPoint)) | Path(http://example.org/gmark/pcontactPoint / http://example.org/gmark/pfriendOf / Path(~http://example.org/gmark/pemployee)))+)'},
            
            {subject: '?x1', predicate: '(:pemployee)', object: '?v0'},
            {subject: '?v0', predicate: '(^:previewer)', object: '?v1'},
            {subject: '?v1', predicate: '(^:phasReview)', object: '?x2'},

            {subject: '?x2', predicate: '(:pconductor)', object: '?v2'},
            {subject: '?v2', predicate: '(^:pfriendOf)', object: '?v3'},
            {subject: '?v3', predicate: '(^:pconductor)', object: '?x3'}
        ]
        return build_resume_query(projection, triples, state)
    })
    solutions = result_set.solutions()
    console.log(`Number of solutions: ${solutions.length}`)
    return result_set
}

module.exports = { 'run': run }