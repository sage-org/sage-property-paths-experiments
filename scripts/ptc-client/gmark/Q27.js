const { eval, build_resume_query } = require('./../engine')
const { ResultSet } = require('./../result-set')

let queries = [
    `PREFIX : <http://example.org/gmark/> 
    SELECT ?x0 ?x4  
    WHERE { 
        ?x0 (^:plocation) ?v0 . ?v0 (^:peditor) ?x1 . 
        ?x1 ((:pauthor/^:pauthor))+ ?x2 . 
        ?x2 ((:peditor/:phomepage/^:phomepage)|(^:pincludes/:pincludes))+ ?x3 . 
        ?x3 (:peditor) ?v1 . ?v1 (:pfollows) ?v2 . ?v2 (^:pfollows) ?x4 .  
    }`,
    `PREFIX : <http://example.org/gmark/> 
    SELECT ?x0 ?x4  
    WHERE { 
        ?x0 (^:plocation) ?v0 . ?v0 (^:peditor) ?x1 . 
        ?x1 ((:pauthor/^:pauthor))+ ?x2 . 
        ?x2 ((:peditor/:phomepage/^:phomepage)|(^:pincludes/:pincludes))+ ?x3 . 
        ?x3 (:peditor) ?v1 . ?v1 (:pfollows) ?v2 . ?v2 (^:pfollows) ?x4 .  
    }`
]

async function run(client, graph) {
    let result_set = new ResultSet()
    result_set.bgp = 1
    await eval(queries[0], client, graph, result_set, (state) => {
        let projection = '?x0 ?x4'
        let triples = [
            {subject: '?x0', predicate: '(^:plocation)', object: '?v0'},
            {subject: '?v0', predicate: '(^:peditor)', object: '?x1'},

            {subject: '?x1', predicate: '((:pauthor/^:pauthor))+', object: '?x2', path: 'Path(Path(http://example.org/gmark/pauthor / Path(~http://example.org/gmark/pauthor))+)'},
            {subject: '?x2', predicate: '((:peditor/:phomepage/^:phomepage)|(^:pincludes/:pincludes))+', object: '?x3', path: 'Path(Path(Path(http://example.org/gmark/peditor / http://example.org/gmark/phomepage / Path(~http://example.org/gmark/phomepage)) | Path(Path(~http://example.org/gmark/pincludes) / http://example.org/gmark/pincludes))+)'},

            {subject: '?x3', predicate: '(:peditor)', object: '?v1'},
            {subject: '?v1', predicate: '(:pfollows)', object: '?v2'},
            {subject: '?v2', predicate: '(^:pfollows)', object: '?x4'}
            
        ]
        return build_resume_query(projection, triples, state)
    })
    result_set.bgp = 2
    await eval(queries[1], client, graph, result_set, (state) => {
        let projection = '?x0 ?x4'
        let triples = [
            {subject: '?x0', predicate: '(^:plocation)', object: '?v0'},
            {subject: '?v0', predicate: '(^:peditor)', object: '?x1'},

            {subject: '?x1', predicate: '((:pauthor/^:pauthor))+', object: '?x2', path: 'Path(Path(http://example.org/gmark/pauthor / Path(~http://example.org/gmark/pauthor))+)'},
            {subject: '?x2', predicate: '((:peditor/:phomepage/^:phomepage)|(^:pincludes/:pincludes))+', object: '?x3', path: 'Path(Path(Path(http://example.org/gmark/peditor / http://example.org/gmark/phomepage / Path(~http://example.org/gmark/phomepage)) | Path(Path(~http://example.org/gmark/pincludes) / http://example.org/gmark/pincludes))+)'},

            {subject: '?x3', predicate: '(:peditor)', object: '?v1'},
            {subject: '?v1', predicate: '(:pfollows)', object: '?v2'},
            {subject: '?v2', predicate: '(^:pfollows)', object: '?x4'}
            
        ]
        return build_resume_query(projection, triples, state)
    })
    let solutions = result_set.solutions() 
    console.log(`Number of solutions: ${solutions.length}`)
}

module.exports = { 'run': run }