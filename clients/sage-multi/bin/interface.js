const program = require('commander')
const fs = require('fs-extra')

const SageClient = require('../src/client').SageClient
const Spy = require('../src/spy').Spy

// ====================================================================================================
// ===== Command line interface =======================================================================
// ====================================================================================================

program.description('Evaluates a set of SPARQL queries using the web preemption model')
    .usage('<server-url> <default-graph-iri> [options]')
    .option('-q, --query <query>', 'Evaluates the given SPARQL query')
    .option('-f, --file <file>', 'Evaluates the SPARQL query in the given file')
    .option('-m, --method <method>', 'Evaluates the SPARQL query using the specified method: [mono, multi]', 'multi')
    .option('-m, --measure <measure>', 'Stores the query execution statistics in the given file')
    .option('-o, --output <output>', 'Stores the query result in the given file')
    .option('-p, --print', 'prints each new result during query execution')
    .option('--timeout <timeout>', 'Sets a time limitation. No more http requests will be sent to the server after the time is out', 0)
    .parse(process.argv)

if (program.args.length !== 2) {
    console.error('Error: missing required arguments ! USAGE: sage-query.js <server-url> <default-graph-iri> [options]')
    process.exit(1)
} else if (!['mono', 'multi', 'alpha'].includes(program.method)) {
    console.error('Error: invalid evaluation strategy. Available strategies are: [mono, multi, direct]')
    console.error('- mono : property paths queries are evaluated using a client-side automaton-based approach with a mono-predicate automaton')
    console.error('- multi : property paths queries are evaluated using a client-side automaton-based approach with a multi-predicate automaton')
} else if (!program.file && !program.query) {
    process.stderr.write('Error: you must specify a SPARQL query to execute.\nSee ./comunica.js --help for more details.\n')
    process.exit(1)
}

// ====================================================================================================
// ===== Query evaluation =============================================================================
// ====================================================================================================

function get_client(server, graph, spy) {
    if (program.method === 'mono') {
        let options = {'property-paths-strategy': 'mono-predicate-automaton'}
        return new SageClient(server, graph, spy, options=options)
    } else {
        let options = {'property-paths-strategy': 'multi-predicate-automaton'}
        return new SageClient(server, graph, spy, options=options)
    } 
}

function eval(server, graph, query) {
    return new Promise((resolve, _) => {
        let spy = new Spy()
        let solutions = []
        let start_time = Date.now()
        let execution_time = 0
        let http_calls = 0
        let data_transfer = 0
        let data_transfer_approach_overhead = 0
        let data_transfer_duplicates_overhead = 0
        let nb_results = 0
        let nb_duplicates = 0
        let state = 'complete'
        get_client(server, graph, spy).execute(query, program.timeout).subscribe(
            (solution) => {
                solutions.push(solution)
                if (program.print) {
                    console.log(solution)
                }
            }, (error) => {
                console.log(error)
                execution_time = (Date.now() - start_time) / 1000.0
                execution_time = (program.timeout > 0 && execution_time > program.timeout) ? program.timeout : execution_time
                http_calls = spy.nb_http_calls
                data_transfer = spy.data_transfer
                data_transfer_approach_overhead = Math.abs(data_transfer - Buffer.byteLength(JSON.stringify(solutions), 'utf8'))
                nb_results = solutions.length
                let statistics = [
                    execution_time, 
                    spy.nb_http_calls, 
                    spy.data_transfer, 
                    data_transfer_approach_overhead, 
                    data_transfer_duplicates_overhead, 
                    nb_results, 
                    nb_duplicates, 
                    'error']
                resolve([solutions, statistics])
            }, () => {
                execution_time = (Date.now() - start_time) / 1000.0
                execution_time = (program.timeout > 0 && execution_time >= program.timeout) ? program.timeout : execution_time
                http_calls = spy.nb_http_calls
                data_transfer = spy.data_transfer
                data_transfer_approach_overhead = Math.abs(data_transfer - Buffer.byteLength(JSON.stringify(solutions), 'utf8'))
                nb_results = solutions.length
                state = (program.timeout > 0 && execution_time >= program.timeout) ? 'timeout' : 'complete'
                let statistics = [
                    execution_time, 
                    spy.nb_http_calls, 
                    spy.data_transfer, 
                    data_transfer_approach_overhead, 
                    data_transfer_duplicates_overhead, 
                    nb_results, 
                    nb_duplicates, 
                    state]
                resolve([solutions, statistics])
            }
        )
    })
}

async function execute(server, graph, query) {
    let [solutions, statistics] = await eval(server, graph, query)
    // Write the query execution statistics in the given file
    if (program.measure) {
        let data = statistics.join(',') + '\n'
        fs.writeFileSync(program.measure, data, {encoding: 'utf-8'})
    }
    // Writes the query result in the given file
    if (program.output) {
        let data = JSON.stringify(solutions)
        fs.writeFileSync(program.output, data, {encoding: 'utf-8'})
    }
    // Prints query execution statistics
    console.log(`Execution complete !
    - time: ${statistics[0]} sec
    - calls: ${statistics[1]} http requests
    - transfer: ${statistics[2]} bytes
        - approach overhead: ${statistics[3]} bytes
        - duplicates overhead: ${statistics[4]} bytes
    - solutions: ${statistics[5]} solution mappings
        - duplicates: ${statistics[6]}`)
}

if (program.file) {
    execute(program.args[0], program.args[1], fs.readFileSync(program.file).toString()) 
} else {
    execute(program.args[0], program.args[1], program.query)
} 