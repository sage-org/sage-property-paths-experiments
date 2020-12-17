const { eval, build_resume_query } = require('./../engine')
const { ResultSet } = require('./../result-set')

let queries = [
    `PREFIX : <http://example.org/gmark/> 
    SELECT ?x2 ?x1 ?x0 
    WHERE { 
        ?x0 (:peditor) ?v0 . ?v0 (:plike) ?x1 . 
        ?x1 (:partist) ?v1 . ?v1 (^:pfollows) ?x2 . 
        ?x2 (^:pconductor) ?v2 . ?v2 (^:pincludes) ?v3 . ?v3 (:pincludes) ?x3 . 
        ?x3 ((:peditor/^:pauthor))+ ?x4 .
    }`,
    `PREFIX : <http://example.org/gmark/> 
    SELECT ?x2 ?x1 ?x0 
    WHERE { 
        ?x0 (:peditor) ?v0 . ?v0 (:plike) ?x1 .
        ?x1 (:partist) ?v1 . ?v1 (^:pfollows) ?x2 . 
        ?x2 (^:peditor) ?x3 . 
        ?x3 ((:peditor/^:pauthor))+ ?x4 .
    }`,
    `PREFIX : <http://example.org/gmark/> 
    SELECT ?x2 ?x1 ?x0 
    WHERE { 
        ?x0 (:pauthor) ?v0 . ?v0 (:pfollows) ?v1 . ?v1 (:plike) ?x1 . 
        ?x1 (:partist) ?v2 . ?v2 (^:pfollows) ?x2 . 
        ?x2 (^:pconductor) ?v3 . ?v3 (^:pincludes) ?v4 . ?v4 (:pincludes) ?x3 .  
        ?x3 ((:peditor/^:pauthor))+ ?x4 .
    }`,
    `PREFIX : <http://example.org/gmark/> 
    SELECT ?x2 ?x1 ?x0  
    WHERE { 
        ?x0 (:pauthor) ?v0 . ?v0 (:pfollows) ?v1 . ?v1 (:plike) ?x1 . 
        ?x1 (:partist) ?v2 . ?v2 (^:pfollows) ?x2 . 
        ?x2 (^:peditor) ?x3 . 
        ?x3 ((:peditor/^:pauthor))+ ?x4 .
    }`
]

async function run(client, graph) {
    let result_set = new ResultSet()
    result_set.bgp = 1
    await eval(queries[0], client, graph, result_set, (state) => {
        let projection = '?x2 ?x1 ?x0'
        let triples = [
            {subject: '?x0', predicate: '(:peditor)', object: '?v0'},
            {subject: '?v0', predicate: '(:plike)', object: '?x1'},
            {subject: '?x1', predicate: '(:partist)', object: '?v1'},
            {subject: '?v1', predicate: '(^:pfollows)', object: '?x2'},
            {subject: '?x2', predicate: '(^:pconductor)', object: '?v2'},
            {subject: '?v2', predicate: '(^:pincludes)', object: '?v3'},
            {subject: '?v3', predicate: '(:pincludes)', object: '?x3'},
            {subject: '?x3', predicate: '((:peditor/^:pauthor))+', object: '?x4', path: 'Path(Path(http://example.org/gmark/peditor / Path(~http://example.org/gmark/pauthor))+)'}
        ]
        return build_resume_query(projection, triples, state)
    })
    result_set.bgp = 2
    await eval(queries[1], client, graph, result_set, (state) => {
        let projection = '?x2 ?x1 ?x0'
        let triples = [
            {subject: '?x0', predicate: '(:peditor)', object: '?v0'},
            {subject: '?v0', predicate: '(:plike)', object: '?x1'},
            {subject: '?x1', predicate: '(:partist)', object: '?v1'},
            {subject: '?v1', predicate: '(^:pfollows)', object: '?x2'},
            {subject: '?x2', predicate: '(^:peditor)', object: '?x3'},
            {subject: '?x3', predicate: '((:peditor/^:pauthor))+', object: '?x4', path: 'Path(Path(http://example.org/gmark/peditor / Path(~http://example.org/gmark/pauthor))+)'}
        ]
        return build_resume_query(projection, triples, state)
    })
    result_set.bgp = 3
    await eval(queries[2], client, graph, result_set, (state) => {
        let projection = '?x2 ?x1 ?x0'
        let triples = [
            {subject: '?x0', predicate: '(:pauthor)', object: '?v0'},
            {subject: '?v0', predicate: '(:pfollows)', object: '?v1'},
            {subject: '?v1', predicate: '(:plike)', object: '?x1'},
            {subject: '?x1', predicate: '(:partist)', object: '?v2'},
            {subject: '?v2', predicate: '(^:pfollows)', object: '?x2'},
            {subject: '?x2', predicate: '(^:pconductor)', object: '?v3'},
            {subject: '?v3', predicate: '(^:pincludes)', object: '?v4'},
            {subject: '?v4', predicate: '(:pincludes)', object: '?x3'},
            {subject: '?x3', predicate: '((:peditor/^:pauthor))+', object: '?x4', path: 'Path(Path(http://example.org/gmark/peditor / Path(~http://example.org/gmark/pauthor))+)'}
        ]
        return build_resume_query(projection, triples, state)
    })
    result_set.bgp = 4
    await eval(queries[3], client, graph, result_set, (state) => {
        let projection = '?x2 ?x1 ?x0'
        let triples = [
            {subject: '?x0', predicate: '(:pauthor)', object: '?v0'},
            {subject: '?v0', predicate: '(:pfollows)', object: '?v1'},
            {subject: '?v1', predicate: '(:plike)', object: '?x1'},
            {subject: '?x1', predicate: '(:partist)', object: '?v2'},
            {subject: '?v2', predicate: '(^:pfollows)', object: '?x2'},
            {subject: '?x2', predicate: '(^:peditor)', object: '?x3'},
            {subject: '?x3', predicate: '((:peditor/^:pauthor))+', object: '?x4', path: 'Path(Path(http://example.org/gmark/peditor / Path(~http://example.org/gmark/pauthor))+)'}
        ]
        return build_resume_query(projection, triples, state)
    })
    let solutions = result_set.solutions() 
    console.log(`Number of solutions: ${solutions.length}`)
}

module.exports = { 'run': run }