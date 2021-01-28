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
    .option('-m, --measure', 'Stores the query execution statistics in the given file')
    .option('-o, --output', 'Stores the query result in the given file')
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
    // Write the query execution statistics in the given file
    if (program.measure) {
        let state = 'complete'
        if (elapsed_time === timeout) {
            state = 'timeout'
        } else if (!result_set.complete) {
            state = 'incomplete'
        } 
        let row = [
            (program.timeout > 0 && elapsed_time > timeout) ? program.timeout : elapsed_time,
            spy.nb_http_calls,
            spy.data_transfer,
            result_set.size,
            state,
            spy.solutions_size,
            spy.control_tuples_size,
            result_set.nb_duplicates,   
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
    - time: ${elapsed_time} sec
    - calls: ${spy.nb_http_calls} http requests
    - transfer: ${spy.data_transfer} bytes
    - solutions: ${result_set.size} solution mappings`)
}

if (program.file) {
    execute(program.args[0], program.args[1], JSON.parse(fs.readFileSync(program.file).toString())) 
} else {
    execute(program.args[0], program.args[1], program.query)
} 