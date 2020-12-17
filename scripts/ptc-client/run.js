const program = require('commander')
const HttpClient = require('./http-client').HttpClient
const Spy = require('./spy').Spy

const Q1 = require('./gmark/Q1').run
const Q2 = require('./gmark/Q2').run 
const Q3 = require('./gmark/Q3').run 
const Q4 = require('./gmark/Q4').run
const Q5 = require('./gmark/Q5').run 
const Q6 = require('./gmark/Q6').run 
const Q7 = require('./gmark/Q7').run
const Q8 = require('./gmark/Q8').run
const Q9 = require('./gmark/Q9').run
const Q10 = require('./gmark/Q10').run
const Q11 = require('./gmark/Q11').run
const Q12 = require('./gmark/Q12').run
const Q13 = require('./gmark/Q13').run
const Q14 = require('./gmark/Q14').run
const Q15 = require('./gmark/Q15').run
const Q16 = require('./gmark/Q16').run
const Q17 = require('./gmark/Q17').run
const Q18 = require('./gmark/Q18').run
const Q19 = require('./gmark/Q19').run
const Q20 = require('./gmark/Q20').run
const Q21 = require('./gmark/Q21').run
const Q22 = require('./gmark/Q22').run
const Q23 = require('./gmark/Q23').run
const Q24 = require('./gmark/Q24').run
const Q25 = require('./gmark/Q25').run
const Q26 = require('./gmark/Q26').run
const Q27 = require('./gmark/Q27').run
const Q28 = require('./gmark/Q28').run
const Q29 = require('./gmark/Q29').run
const Q30 = require('./gmark/Q30').run

// ====================================================================================================
// ===== Command line interface =======================================================================
// ====================================================================================================

program
  .description('Execute a SPARQL query using a SaGe server and the IRI of the default RDF graph')
  .usage('<server-url> <default-graph-iri> [options]')
  .option('-o, --output <output>', 'evaluates the SPARQL query in the given file')
  .option('-m, --measure <measure>', 'measure the query execution time (in seconds) & append it to a file')
  .option('-t, --timeout <timeout>', 'stops the query execution after the given time limit (in seconds)', 600)
  .option('-p, --print', 'prints each new result during query execution')
  .option('--method <method>', 'Evaluates the SPARQL queries using the specified method: [mono, multi, alpha, direct]', 'direct')
  .parse(process.argv)

if (program.args.length !== 2) {
    console.error('Error: missing required arguments ! USAGE: sage-query.js <server-url> <default-graph-iri> <output> [options]')
    process.exit(1)
}

// ====================================================================================================
// ===== Variables initialization =====================================================================
// ====================================================================================================

let server_url = program.args[0]
let default_graph_iri = program.args[1]

async function run_query(Q) {
    let spy = new Spy()
    let client = new HttpClient(server_url, spy)
    let start_time = Date.now()
    await Q(client, default_graph_iri)
    let end_time = Date.now()
    console.log(spy)
    console.log(`time: ${(end_time - start_time) / 1000} sec`)
}

run_query(Q27)