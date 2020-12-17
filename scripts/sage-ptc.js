const program = require('commander')
const fs = require('fs-extra')
const path = require('path')

const PTCClient = require('./ptc-client/client').PTCClient
const Spy = require('./ptc-client/spy').Spy

// ====================================================================================================
// ===== Command line interface =======================================================================
// ====================================================================================================

program.description('Evaluates a set of SPARQL queries using the web preemption model')
    .usage('<server-url> <default-graph-iri> <output> [options]')
    .option('-q, --query <query>', 'Evaluates the given SPARQL query')
    .option('-f, --files <files...>', 'Evaluates the SPARQL queries stored in the given files')
    .option('-d, --directory <directory>', 'Evaluates the SPARQL queries stored in the given directory')
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

// Get the experimental study parameters

let warm_up_run = program.warmup
let number_of_iteration = warm_up_run ? program.repeat + 1 : program.repeat
let timeout = program.timeout

// ====================================================================================================
// ===== Queries evaluation  ==========================================================================
// ====================================================================================================

async function execute(query) {
    let spy = new Spy()
    let start_time = Date.now()
    let result_set = await new PTCClient(server_url, default_graph_iri, spy).execute_one_call(query, timeout)
    let end_time = Date.now()
    let execution_time = (end_time - start_time) / 1000.0
    execution_time = execution_time > timeout ? timeout : execution_time
    let http_calls = spy.nbHTTPCalls
    let data_transfer = spy.transferSize
    let nb_results = result_set.solutions().length
    let nb_duplicates = result_set.duplicates()
    let state = 'complete'
    if (execution_time === timeout) {
        state = 'timeout'
    } else if (!result_set.complete) {
        state = 'incomplete'
    } 
    return [execution_time, http_calls, data_transfer, nb_results, nb_duplicates, state]
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

function write_statistics() {
    let data = 'query,approach,execution_time,http_calls,data_transfer,nb_results,nb_duplicates,state\n'
    for (let query of Object.keys(statistics)) {
        let row = [
            query,
            'SaGeClient-PTC',
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
                console.log(`'results: \n\t- exec_time: ${execution_time} sec \n\t- calls: ${http_calls} \n\t- transfer: ${data_transfer} bytes \n\t- solutions: ${nb_results} \n\t- duplicates: ${nb_duplicates} \n\t- state: ${state}'`)
            } else {
                console.log('results not recorded !')
            }
        }
    }
    statistics_average()
    write_statistics()
}

run()