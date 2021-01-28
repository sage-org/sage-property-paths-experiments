const program = require('commander')
const fs = require('fs-extra')

const PTCClient = require('../src/client').PTCClient
const Spy = require('../src/spy').Spy

// ====================================================================================================
// ===== Command line interface =======================================================================
// ====================================================================================================

program.description('Evaluates a set of SPARQL queries using the web preemption model')
    .usage('<server-url> <default-graph-iri> [options]')
    .option('-q, --query <query>', 'Evaluates the given SPARQL query')
    .option('-f, --file <file>', 'Evaluates the SPARQL query in the given file')
    .option('-m, --measure <measure>', 'Stores the query execution statistics in the given file')
    .option('-o, --output <output>', 'Stores the query result in the given file')
    .option('--not-expand-frontiers', 'When a frontier node is found, it is not expanded', false)
    .option('--timeout <timeout>', 'Sets a time limitation. No more http requests will be sent to the server after the time is out', 0)
    .parse(process.argv)

if (program.args.length !== 2) {
    console.error('Error: missing required arguments ! USAGE: sage-query.js <server-url> <default-graph-iri> [options]')
    process.exit(1)
} else if (!program.file && !program.query) {
    process.stderr.write('Error: you must specify a SPARQL query to execute.\nSee ./comunica.js --help for more details.\n')
    process.exit(1)
}

// ====================================================================================================
// ===== Query evaluation =============================================================================
// ====================================================================================================

async function execute(server, graph, query) {
    let spy = new Spy()
    let start_time = Date.now()
    let result_set = await new PTCClient(server, graph, spy).execute(query, program.timeout, !program.notExpandFrontiers)
    let elapsed_time = (Date.now() - start_time) / 1000.0
    // Retrieves query execution statistics
    let execution_time = (program.timeout > 0 && elapsed_time > timeout) ? program.timeout : elapsed_time
    let nb_calls = spy.nb_http_calls
    let data_transfer = spy.data_transfer
    let data_transfer_approach_overhead = spy.control_tuples_size
    let data_transfer_duplicates_overhead = Math.ceil( result_set.nb_duplicates / (result_set.nb_solutions + result_set.nb_duplicates) ) * data_transfer
    let nb_results = result_set.nb_solutions
    let nb_duplicates = result_set.nb_duplicates
    let state = 'complete'
    if (program.timeout > 0 && elapsed_time > program.timeout) {
        state = 'timeout'
    } else if (!result_set.complete) {
        state = 'incomplete'
    } 
    // Write the query execution statistics in the given file
    if (program.measure) {
        let row = [
            execution_time,
            nb_calls,
            data_transfer,
            data_transfer_approach_overhead,
            data_transfer_duplicates_overhead,
            nb_results,
            nb_duplicates,
            state
        ]
        data += row.join(',') + '\n'
        fs.writeFileSync(program.measure, data, {encoding: 'utf-8'})
    }
    // Writes the query result in the given file
    if (program.output) {
        let data = JSON.stringify(result_set.solutions)
        fs.writeFileSync(program.output, data, {encoding: 'utf-8'})
    }
    // Prints query execution statistics
    console.log(`Execution complete !
    - time: ${execution_time} sec
    - calls: ${nb_calls} http requests
    - transfer: ${data_transfer} bytes
        - approach overhead: ${data_transfer_approach_overhead} bytes
        - duplicates overhead: ${data_transfer_duplicates_overhead} bytes
    - solutions: ${nb_results} solution mappings
        - duplicates: ${nb_duplicates}`)
}

if (program.file) {
    execute(program.args[0], program.args[1], JSON.parse(fs.readFileSync(program.file).toString())) 
} else {
    execute(program.args[0], program.args[1], program.query)
} 