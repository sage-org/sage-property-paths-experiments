const program = require('commander')
const fs = require('fs-extra')
const path = require('path')

const SageClient = require('sage-client/dist/client').default
const DirectClient = require('sage-client/dist/direct-client').default
const Spy = require('sage-client/dist/spy').default

// ====================================================================================================
// ===== Command line interface =======================================================================
// ====================================================================================================

program.description('Evaluates a set of SPARQL queries using the web preemption model')
    .usage('<server-url> <default-graph-iri> <output> [options]')
    .option('-q, --query <query>', 'Evaluates the given SPARQL query')
    .option('-f, --files <files...>', 'Evaluates the SPARQL queries stored in the given files')
    .option('-d, --directory <directory>', 'Evaluates the SPARQL queries stored in the given directory')
    .option('-m, --method <method>', 'Evaluates the SPARQL queries using the specified method: [mono, multi, alpha, direct]', 'direct')
    .option('-n, --repeat <iterations>', 'Evaluates the SPARQL queries n times and retuns the average of the n iterations', 1)
    .option('-p, --print', 'prints each new result during query execution')
    .option('--warmup', 'Evaluates the SPARQL queries one time without registering any statistics', false)
    .option('--timeout <timeout>', 'Sets a timeout for each SPARQL query. No more queries will be sent to the server after the time is out')
    .parse(process.argv)

if (program.args.length !== 3) {
    console.error('Error: missing required arguments ! USAGE: sage-query.js <server-url> <default-graph-iri> <output> [options]')
    process.exit(1)
}

// ====================================================================================================
// ===== Variables initialization =====================================================================
// ====================================================================================================

let server_url = program.args[0]
let default_graph_iri = program.args[1]
let output_file = program.args[2]

// Get SPARQL queries from the command line arguments

let queries = []
let statistics = {}

if (program.query) {
    queries.push({'name': 'command-line query', 'value': program.query})
    statistics['command-line query'] = {
        'data_transfer': [],
        'execution_time': [],
        'http_calls': [],
        'nb_results': [],
        'nb_duplicates': [],
        'state': 'complete'
    }
}
if (program.files) {
    for (let file of program.files) {
        if (fs.existsSync(file)) {
            let query = fs.readFileSync(file, 'utf-8')
            let query_name = path.basename(file, '.sparql')
            queries.push({'name': query_name, 'value': query})
            statistics[query_name] = {
                'data_transfer': [],
                'execution_time': [],
                'http_calls': [],
                'nb_results': [],
                'nb_duplicates': [],
                'state': 'complete'
            }
        } else {
            console.error(`Error: the file ${file} does not exist...`)
        }
    }
}
if (program.directory) {
    if (fs.existsSync(program.directory)) {
        for (let file of fs.readdirSync(program.directory)) {
            if (path.extname(file) === '.sparql') {
                let query = fs.readFileSync(`${program.directory}/${file}`, 'utf-8')
                let query_name = path.basename(file, '.sparql')
                queries.push({'name': query_name, 'value': query})
                statistics[query_name] = {
                    'data_transfer': [],
                    'execution_time': [],
                    'http_calls': [],
                    'nb_results': [],
                    'nb_duplicates': [],
                    'state': 'complete'
                }
            }
        }
    } else {
        console.error(`Error: the directory ${program.directory} does not exist...`)
    }
}
if (queries.length === 0) {
    console.error('Error: no SPARQL query found...')
}

// Get the evaluation strategy from the command line arguments

let method = program.method
if (!['mono', 'multi', 'alpha', 'direct'].includes(method)) {
    console.error('Error: invalid evaluation strategy. Available strategies are: [mono, multi, direct]')
    console.error('- mono : property paths queries are evaluated using a client-side automaton-based approach with a mono-predicate automaton')
    console.error('- multi : property paths queries are evaluated using a client-side automaton-based approach with a multi-predicate automaton')
    console.error('- alpha : property paths queries are evaluated using a client-side alpha operator to support transitive closures')
    console.error('- direct : property paths queries are evaluated on the server')
}

// Get the experimental study parameters

let warm_up_run = program.warmup
let number_of_iteration = warm_up_run ? program.repeat + 1 : program.repeat
let timeout = program.timeout

// ====================================================================================================
// ===== Queries evaluation  ==========================================================================
// ====================================================================================================

function get_client(spy) {
    if (method === 'direct') {
        return new DirectClient(server_url, default_graph_iri, spy)
    } else if (method === 'mono') {
        let options = {'property-paths-strategy': 'mono-predicate-automaton'}
        return new SageClient(server_url, default_graph_iri, spy, options=options)
    } else if (method === 'multi') {
        let options = {'property-paths-strategy': 'multi-predicate-automaton'}
        return new SageClient(server_url, default_graph_iri, spy, options=options)
    } else if (method === 'alpha') {
        let options = {'property-paths-strategy': 'alpha-operator'}
        return new SageClient(server_url, default_graph_iri, spy, options=options)
    }
}

function format_results(results) {
    let bindings = []
    for (let result of results) {
        let binding = {}
        for (let mapping of result._content) {
            binding[mapping[0]] = mapping[1]
        }
        bindings.push(binding)
    }
    return bindings
}

function extract_imprint(solution) {
    for (let mapping of solution._content) {
        if (mapping[0] === '?imprint') {
            return mapping[1]
        }
    }
    throw new Error("Each solution mapping must have an imprint !")
}

function execute(query) {
    return new Promise((resolve, _) => {
        let spy = new Spy()
        let results = []
        let memory = {}
        let start_time = Date.now()
        let execution_time = 0
        let http_calls = 0
        let data_transfer = 0
        let nb_results = 0
        let nb_duplicates = 0
        get_client(spy).execute(query, timeout).subscribe(
            (solution) => {
                results.push(solution)
                if (method === 'direct') {
                    let imprint = extract_imprint(solution)
                    if (imprint in memory) {
                        nb_duplicates++
                    } else {
                        memory[imprint] = true
                    }
                }
                if (program.imprint) {
                    console.log(solution)
                    console.log(`number of results: ${results.length - nb_duplicates}`)
                }
            }, (error) => {
                console.log(error)
                let end_time = Date.now()
                execution_time = (end_time - start_time) / 1000.0
                http_calls = spy.nbHTTPCalls
                data_transfer = spy.transferSize
                nb_results = results.length
                state = spy.queryState
                resolve([execution_time, http_calls, data_transfer, nb_results, nb_duplicates, 'error'])
            }, () => {
                let end_time = Date.now()
                execution_time = (end_time - start_time) / 1000.0
                execution_time = execution_time > timeout ? timeout : execution_time
                http_calls = spy.nbHTTPCalls
                data_transfer = spy.transferSize
                nb_results = results.length
                let state = spy.queryState
                resolve([execution_time, http_calls, data_transfer, nb_results, nb_duplicates, state])
            }
        )
    })
}

function compute_average(values) {
    let sum = 0
    for (let value of values) {
        sum += value
    }
    return sum / values.length
}

function statistics_average() {
    for (let query of Object.keys(statistics)) {
        statistics[query]['data_transfer'] = compute_average(statistics[query]['data_transfer'])
        statistics[query]['execution_time'] = compute_average(statistics[query]['execution_time'])
        statistics[query]['http_calls'] = compute_average(statistics[query]['http_calls'])
        statistics[query]['nb_results'] = compute_average(statistics[query]['nb_results'])
        statistics[query]['nb_duplicates'] = compute_average(statistics[query]['nb_duplicates'])
    }
}

function get_method() {
    if (method === 'direct') {
        return 'SaGe'
    } else if (method === 'mono') {
        return 'SaGe Client - mono'
    } else if (method === 'multi') {
        return 'SaGe Client - multi'
    } else if (method === 'alpha') {
        return 'SaGe Client - alpha'
    }
}

function write_statistics() {
    let data = 'query,approach,execution_time,http_calls,data_transfer,nb_results,nb_duplicates,state\n'
    for (let query of Object.keys(statistics)) {
        let approach = get_method()
        let row = [
            query,
            approach,
            statistics[query]['execution_time'],
            statistics[query]['http_calls'],
            statistics[query]['data_transfer'],
            statistics[query]['nb_results'],
            statistics[query]['nb_duplicates'],
            statistics[query]['state']
        ]
        data += row.join(',') + '\n'
    }
    fs.writeFileSync(output_file, data, {encoding: 'utf-8'})
}

async function run() {
    console.log(`Evaluation using SaGe: \n\t- url: ${server_url} \n\t- graph: ${default_graph_iri} \n\t- timeout: ${timeout} \n\t- iterations: ${number_of_iteration} \n\t- warmup: ${warm_up_run}`)
    for (let iteration = 0; iteration < number_of_iteration; iteration++) {
        for (let query of queries) {
            console.log(`iteration: ${iteration} - query: ${query.name}`)
            let [execution_time, http_calls, data_transfer, nb_results, nb_duplicates, state] = await execute(query.value)
            if ((!warm_up_run || iteration > 0) && statistics[query.name]['state'] === 'complete') {
                statistics[query.name]['data_transfer'].push(data_transfer)
                statistics[query.name]['execution_time'].push(execution_time)
                statistics[query.name]['http_calls'].push(http_calls)
                statistics[query.name]['nb_results'].push(nb_results)
                statistics[query.name]['nb_duplicates'].push(nb_duplicates)
                statistics[query.name]['state'] = state
                console.log(`'results: \n\t- exec_time: ${execution_time} sec \n\t- calls: ${http_calls} \n\t- transfer: ${data_transfer} bytes \n\t- solutions: ${nb_results - nb_duplicates} \n\t- duplicates: ${nb_duplicates} \n\t- state: ${state}'`)
            } else {
                console.log('results not recorded !')
            }
        }
    }
    statistics_average()
    write_statistics()
}

run()