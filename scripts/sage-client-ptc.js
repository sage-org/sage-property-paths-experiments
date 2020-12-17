const program = require('commander')
const fs = require('fs-extra')
const path = require('path')

const PTCClient = require('./ptc-client/client').PTCClient
const Spy = require('./ptc-client/spy').Spy

// GMark queries for the TPC approach

const Q1 = require('./ptc-client/gmark/Q1').run
const Q2 = require('./ptc-client/gmark/Q2').run 
const Q3 = require('./ptc-client/gmark/Q3').run 
const Q4 = require('./ptc-client/gmark/Q4').run
const Q5 = require('./ptc-client/gmark/Q5').run 
const Q6 = require('./ptc-client/gmark/Q6').run 
const Q7 = require('./ptc-client/gmark/Q7').run
const Q8 = require('./ptc-client/gmark/Q8').run
const Q9 = require('./ptc-client/gmark/Q9').run
const Q10 = require('./ptc-client/gmark/Q10').run
const Q11 = require('./ptc-client/gmark/Q11').run
const Q12 = require('./ptc-client/gmark/Q12').run
const Q13 = require('./ptc-client/gmark/Q13').run
const Q14 = require('./ptc-client/gmark/Q14').run
const Q15 = require('./ptc-client/gmark/Q15').run
const Q16 = require('./ptc-client/gmark/Q16').run
const Q17 = require('./ptc-client/gmark/Q17').run
const Q18 = require('./ptc-client/gmark/Q18').run
const Q19 = require('./ptc-client/gmark/Q19').run
const Q20 = require('./ptc-client/gmark/Q20').run
const Q21 = require('./ptc-client/gmark/Q21').run
const Q22 = require('./ptc-client/gmark/Q22').run
const Q23 = require('./ptc-client/gmark/Q23').run
const Q24 = require('./ptc-client/gmark/Q24').run
const Q25 = require('./ptc-client/gmark/Q25').run
const Q26 = require('./ptc-client/gmark/Q26').run
const Q27 = require('./ptc-client/gmark/Q27').run
const Q28 = require('./ptc-client/gmark/Q28').run
const Q29 = require('./ptc-client/gmark/Q29').run
const Q30 = require('./ptc-client/gmark/Q30').run

// ====================================================================================================
// ===== Command line interface =======================================================================
// ====================================================================================================

program.description('Evaluates a set of SPARQL queries using the web preemption model')
    .usage('<server-url> <default-graph-iri> <output> [options]')
    .option('-w, --workload <workload>', 'Evaluates the given workload of queries: [GMark, Wikidata]', 'GMark')
    .option('-n, --repeat <iterations>', 'Evaluates the SPARQL queries n times and retuns the average of the n iterations', 1)
    .option('-p, --print', 'prints each new result during query execution')
    .option('--warmup', 'Evaluates the SPARQL queries one time without registering any statistics', false)
    .option('--timeout <timeout>', 'Sets a timeout for each SPARQL query. No more queries will be sent to the server after the time is out')
    .option('--tpcgmark', 'Evaluates the gMark queries using the TPC approach')
    .option('--tpcwikidata', 'Evaluates the Wikidata queries using the TPC approach')
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

if (program.workload === 'GMark') {
    queries = [
        {'name': 'query_1', 'value': require('./ptc-client/gmark/Q1')},
        {'name': 'query_2', 'value': require('./ptc-client/gmark/Q2')},
        {'name': 'query_3', 'value': require('./ptc-client/gmark/Q3')},
        {'name': 'query_4', 'value': require('./ptc-client/gmark/Q4')},
        {'name': 'query_5', 'value': require('./ptc-client/gmark/Q5')},
        {'name': 'query_6', 'value': require('./ptc-client/gmark/Q6')},
        {'name': 'query_7', 'value': require('./ptc-client/gmark/Q7')},
        {'name': 'query_8', 'value': require('./ptc-client/gmark/Q8')},
        {'name': 'query_9', 'value': require('./ptc-client/gmark/Q9')},
        {'name': 'query_10', 'value': require('./ptc-client/gmark/Q10')},
        {'name': 'query_11', 'value': require('./ptc-client/gmark/Q11')},
        {'name': 'query_12', 'value': require('./ptc-client/gmark/Q12')},
        {'name': 'query_13', 'value': require('./ptc-client/gmark/Q13')},
        {'name': 'query_14', 'value': require('./ptc-client/gmark/Q14')},
        {'name': 'query_15', 'value': require('./ptc-client/gmark/Q15')},
        {'name': 'query_16', 'value': require('./ptc-client/gmark/Q16')},
        {'name': 'query_17', 'value': require('./ptc-client/gmark/Q17')},
        {'name': 'query_18', 'value': require('./ptc-client/gmark/Q18')},
        {'name': 'query_19', 'value': require('./ptc-client/gmark/Q19')},
        {'name': 'query_20', 'value': require('./ptc-client/gmark/Q20')},
        {'name': 'query_21', 'value': require('./ptc-client/gmark/Q21')},
        {'name': 'query_22', 'value': require('./ptc-client/gmark/Q22')},
        {'name': 'query_23', 'value': require('./ptc-client/gmark/Q23')},
        {'name': 'query_24', 'value': require('./ptc-client/gmark/Q24')},
        {'name': 'query_25', 'value': require('./ptc-client/gmark/Q25')},
        {'name': 'query_26', 'value': require('./ptc-client/gmark/Q26')},
        {'name': 'query_27', 'value': require('./ptc-client/gmark/Q27')},
        {'name': 'query_28', 'value': require('./ptc-client/gmark/Q28')},
        {'name': 'query_29', 'value': require('./ptc-client/gmark/Q29')},
        {'name': 'query_30', 'value': require('./ptc-client/gmark/Q30')}
    ]
    for (let query of queries) {
        statistics[query.name] = {
            'data_transfer': [],
            'execution_time': [],
            'http_calls': [],
            'nb_results': [],
            'nb_duplicates': [],
            'state': 'complete'
        }
    }
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
    let result_set = await new PTCClient(server_url, default_graph_iri, spy).execute(query, timeout)
    let end_time = Date.now()
    let execution_time = (end_time - start_time) / 1000.0
    execution_time = execution_time > timeout ? timeout : execution_time
    let state = execution_time === timeout ? 'timeout' : 'complete'
    let http_calls = spy.nbHTTPCalls
    let data_transfer = spy.transferSize
    let nb_results = result_set.solutions().length
    let nb_duplicates = result_set.duplicates()
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