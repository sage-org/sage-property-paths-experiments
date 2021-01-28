const crypto = require('crypto-js')
const Parser = require('sparqljs').Parser
const Generator = require('sparqljs').Generator

async function execute(query, client, graph) {
    let solutions = []
    let control_tuples = []
    let has_next = true
    let next = null
    while (has_next) {
        let response = await client.query(query, graph, next)
        solutions.push(...response.bindings)
        control_tuples.push(...response.controls)
        has_next = response.hasNext
        next = has_next ? response.next : null
    }
    return [solutions, control_tuples]
}

function generate_id(control_tuple) {
    return crypto.MD5(JSON.stringify(control_tuple.context)).toString()
}

function has_frontiers_to_expand(control_tuples) {
    let nodes_state = {}
    for (let control_tuple of control_tuples) {
        let id = `${get_id(control_tuple)}-${control_tuple.node}`
        if (id in nodes_state) {
            nodes_state[id] &= (control_tuple.depth == control_tuple.max_depth)
        } else {
            nodes_state[id] = (control_tuple.depth == control_tuple.max_depth)
        }
    }
    for (let is_frontier_node of Object.values(nodes_state)) {
        if (is_frontier_node) {
            return true
        }
    }
    return false
}

function must_expand(control_tuple, visited) {
    if (control_tuple.depth < control_tuple.max_depth) {
        return false
    }
    let id = generate_id(control_tuple)
    return visited[id][control_tuple.node] === control_tuple.depth
}

function must_explore(control_tuple, visited) {
    let id = generate_id(control_tuple)
    return !(id in visited && control_tuple.node in visited[id])
}

function mark_as_visited(control_tuple, visited) {
    let id = generate_id(control_tuple)
    if (!(id in visited)) {
        visited[id] = {}
    }
    visited[id][control_tuple.node] = control_tuple.depth
}

function update_information(control_tuple, visited) {
    let id = generate_id(control_tuple)
    let current_depth = visited[id][control_tuple.node]
    visited[id][control_tuple.node] = control_tuple.depth < current_depth ? control_tuple.depth : current_depth
}

function match_pattern(triple, control_tuple) {
    return triple.subject === control_tuple.path.subject
        && format_path(triple.predicate) === control_tuple.path.predicate
        && triple.object === control_tuple.path.object
}

function bound_pattern(triple, bound_variables) {
    if (triple.subject.startsWith('?') && !bound_variables.includes(triple.subject)) {
        return false
    } else if (triple.object.startsWith('?') && !bound_variables.includes(triple.object)) {
        return false
    } else {
        return true
    }
}

function format_path(path) {
    switch (path.pathType) {
        case '^':
            return `Path(~${format_path(path.items[0])})`
        case '/':
            let sequence_items = path.items.map((subpath) => format_path(subpath))
            return `Path(${sequence_items.join(' / ')})`
        case '|':
            let alternative_items = path.items.map((subpath) => format_path(subpath))
            return `Path(${alternative_items.join(' | ')})`
        case '+':
            return `Path(${format_path(path.items[0])}+)`
        case '*':
            return `Path(${format_path(path.items[0])}*)`
        default:
            return path
    }
}

function extract_triples(query_plan) {
    if (!query_plan.where) {
        throw new Error(`Invalid query: no where clause...`)
    }
    for (let clause of query_plan.where) {
        if (clause.type == 'bgp') {
            return clause.triples
        }
    }
    throw new Error(`Invalid query: no basic graph patterns...`)
}

function expand(query, control_tuple) {
    let query_plan = new Parser().parse(query)
    let triples = extract_triples(query_plan)
    let resume_query = {
        type: 'query',
        queryType: 'SELECT',
        variables: query_plan.variables,
        prefixes: query_plan.prefixes,
        where: []
    }
    // Binds already calculated variables 
    let bound_variables = []
    for (let [variable, value] of Object.entries(control_tuple.context)) {
        bound_variables.push(variable)
        resume_query.where.push({
            type: 'bind',
            variable: variable,
            expression: {
                type: 'operation',
                operator: 'iri',
                args: [ value ]
            }
        })
    }
    // Replaces the path pattern targeted by the control tuple and removes already bound patterns
    let bgp = { type: 'bgp', triples: [] }
    let found = false
    for (let triple of triples) {
        if (match_pattern(triple, control_tuple)) {
            found = true
            bgp.triples.push({
                subject: control_tuple.forward ? control_tuple.node : triple.subject,
                predicate: triple.predicate,
                object: control_tuple.forward ? triple.object : control_tuple.node
            })
        } else if (bound_pattern(triple, bound_variables)) {
            continue
        } else {
            bgp.triples.push(triple)
        }
    }
    if (!found) {
        throw new Error(`Path pattern not found for the control tuple: ${JSON.stringify(control_tuple)}`)
    }
    resume_query.where.push(bgp)
    return new Generator().stringify(resume_query)
}

async function eval(query, client, graph, result_set) {
    let fifo = [{query: query, control_tuple: null}]
    let visited = {}
    while (fifo.length > 0) {
        let step = fifo.shift()
        if (step.control_tuple !== null && !must_expand(step.control_tuple, visited)) {
            continue
        }
        let [solutions, control_tuples] = await execute(step.query, client, graph)
        result_set.append_all(solutions)
        for (let control_tuple of control_tuples) {
            if (must_explore(control_tuple, visited)) {
                mark_as_visited(control_tuple, visited)
                if (must_expand(control_tuple, visited)) {
                    let next_query = expand(step.query, control_tuple)
                    fifo.push({query: next_query, control_tuple: control_tuple})
                }
            } else {
                update_information(control_tuple, visited)
            }
        }
    }
}

module.exports = { eval, execute, has_frontiers_to_expand }