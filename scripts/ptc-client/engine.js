const crypto = require('crypto-js')

async function execute(query, client, graph) {
    console.log(query)
    let bindings = []
    let next_states = []
    let has_next = true
    let next = null
    while (has_next) {
        let response = await client.query(query, graph, next)
        bindings.push(...response.bindings)
        next_states.push(...response.controls)
        has_next = response.hasNext
        if (has_next) {
            next = response.next
        }
    }
    return [bindings, next_states]
}

function md5(solution_mappings) {
    return crypto.MD5(JSON.stringify(solution_mappings)).toString()
}

function must_expand(state, visited) {
    if (state.depth < state.max_depth) {
        return false
    }
    let id = md5(state.context)
    return visited[id][state.node] === state.depth
}

function must_explore(state, visited) {
    let id = md5(state.context)
    return !(id in visited && state.node in visited[id])
}

function mark_as_visited(state, visited) {
    let id = md5(state.context)
    if (!(id in visited)) {
        visited[id] = {}
    }
    visited[id][state.node] = state.depth
}

function min(first, second) {
    if (first < second) {
        return first
    } else {
        return second
    }
}

function update_information(state, visited) {
    let id = md5(state.context)
    visited[id][state.node] = min(visited[id][state.node], state.depth)
}

function match_path_pattern(triple, state) {
    if (triple.path === state.path.predicate) {
        return triple.subject === state.path.subject || triple.object === state.path.object
    }
    return false
}

function is_bound_pattern(triple, bound_variables) {
    if (triple.subject.startsWith('?') && !bound_variables.includes(triple.subject)) {
        return false
    } else if (triple.object.startsWith('?') && !bound_variables.includes(triple.object)) {
        return false
    } else {
        return true
    }
}

function build_resume_query(projection, triples, state) {
    let where = ''
    let bound_variables = []
    for (let [variable, value] of Object.entries(state.context)) {
        bound_variables.push(variable)
        where += `BIND(IRI("${value}") AS ${variable})\n`
    }
    let one_match = false
    for (let triple of triples) {
        if (is_bound_pattern(triple, bound_variables)) {
            continue
        } else if (match_path_pattern(triple, state)) {
            one_match = true
            if (state.forward) {
                where += `<${state.node}> ${triple.predicate} ${triple.object} .\n`
            } else {
                where += `${triple.subject} ${triple.predicate} <${state.node}> .\n`
            }
        } else {
            where += `${triple.subject} ${triple.predicate} ${triple.object} .\n`
        }
    }
    if (!one_match) {
        throw new Error(`Path pattern not found for the state: ${state}`)
    }
    return `PREFIX : <http://example.org/gmark/>
    SELECT ${projection}
    WHERE {
        ${where}
    }`
}

async function eval(query, client, graph, result_set, resume_function) {
    let stack = [{query: query, state: null}]
    let visited = {}
    while (stack.length > 0) {
        let step = stack.shift()
        if (step.state !== null && !must_expand(step.state, visited)) {
            continue
        }
        let [bindings, next_states] = await execute(step.query, client, graph)
        result_set.append_all(bindings)
        for (let next_state of next_states) {
            if (must_explore(next_state, visited)) {
                mark_as_visited(next_state, visited)
                if (must_expand(next_state, visited)) {
                    let next_query = resume_function(next_state)
                    console.log(next_state)
                    console.log(next_query)
                    stack.push({query: next_query, state: next_state})
                }
            } else {
                update_information(next_state, visited)
            }
        }
    }
}

module.exports = { 'eval': eval, 'build_resume_query': build_resume_query }