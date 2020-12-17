const { eval, build_resume_query } = require('./../engine')
const { ResultSet } = require('./../result-set')

let queries = [
    `PREFIX : <http://example.org/gmark/> 
    SELECT ?x3 ?x0 
    WHERE { 
        ?x0 (:pname) ?x1 .  
        ?x0 ((:pfriendOf/^:pfriendOf)|(:phomepage/^:phomepage))+ ?x2 . 
        ?x2 (:plike) ?x3
    }`,
    `PREFIX : <http://example.org/gmark/> 
    SELECT ?x3 ?x0 
    WHERE { 
        ?x0 (:pemail) ?x1 .  
        ?x0 ((:pfriendOf/^:pfriendOf)|(:phomepage/^:phomepage))+ ?x2 . 
        ?x2 (:plike) ?x3
    }`
]

async function run(client, graph) {
    let result_set = new ResultSet()
    result_set.bgp = 1
    await eval(queries[0], client, graph, result_set, (state) => {
        let projection = '?x3 ?x0'
        let triples = [
            {subject: '?x0', predicate: '(:pname)', object: '?x1'},
            {subject: '?x0', predicate: '((:pfriendOf/^:pfriendOf)|(:phomepage/^:phomepage))+', object: '?x2', path: 'Path(Path(Path(http://example.org/gmark/pfriendOf / Path(~http://example.org/gmark/pfriendOf)) | Path(http://example.org/gmark/phomepage / Path(~http://example.org/gmark/phomepage)))+)'},
            {subject: '?x2', predicate: '(:plike)', object: '?x3'}
        ]
        return build_resume_query(projection, triples, state)
    })
    result_set.bgp = 2
    await eval(queries[1], client, graph, result_set, (state) => {
        let projection = '?x3 ?x0'
        let triples = [
            {subject: '?x0', predicate: '(:pemail)', object: '?x1'},
            {subject: '?x0', predicate: '((:pfriendOf/^:pfriendOf)|(:phomepage/^:phomepage))+', object: '?x2', path: 'Path(Path(Path(http://example.org/gmark/pfriendOf / Path(~http://example.org/gmark/pfriendOf)) | Path(http://example.org/gmark/phomepage / Path(~http://example.org/gmark/phomepage)))+)'},
            {subject: '?x2', predicate: '(:plike)', object: '?x3'}
        ]
        return build_resume_query(projection, triples, state)
    })
    let solutions = result_set.solutions() 
    console.log(`Number of solutions: ${solutions.length}`)
}

module.exports = { 'run': run }