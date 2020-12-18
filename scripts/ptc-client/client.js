const HttpClient = require('./http-client').HttpClient
const ResultSet = require('./result-set').ResultSet
const { execute, eval, build_resume_query } = require('./engine')

class PTCClient {

    constructor(server_url, default_graph_iri, spy) {
        this._server_url = server_url
        this._default_graph_iri = default_graph_iri
        this._spy = spy
        this._http = new HttpClient(server_url, spy)
    }

    async run_ptc_client(query) {
        let result_set = new ResultSet()
        for (let [number, subquery] of query.subqueries.entries()) {
            result_set.bgp = number
            await eval(subquery.value, this._http, this._default_graph_iri, result_set, (state) => {
                return build_resume_query(subquery.projection, subquery.triples, state)
            })
        }
        let solutions = result_set.solutions()
        console.log(`Number of solutions: ${solutions.length}`)
        return result_set
    }

    async execute_ptc_client(query, timeout) {
        let http = this._http
        http.open()
        if (timeout) {
            let subscription = setTimeout(function() {
                http.close()
            }, timeout * 1000)
            let result_set = await this.run_ptc_client(query)
            clearTimeout(subscription)
            return result_set
        }
        return await this.run_ptc_client(query)
    }

    async run_ptc(query) {
        let result_set = new ResultSet()
        for (let [number, subquery] of query.subqueries.entries()) {
            result_set.bgp = number
            let [bindings, stars_information] = await execute(subquery.value, this._http, this._default_graph_iri)
            result_set.append_all(bindings)
            for (let row of stars_information) {
                if (row.depth === row.max_depth) {
                    result_set.complete = false
                    break
                }
            }
        }
        return result_set
    }

    async execute_ptc(query, timeout) {
        let http = this._http
        http.open()
        if (timeout) {
            let subscription = setTimeout(function() {
                http.close()
            }, timeout * 1000)
            let result_set = await this.run_ptc(query)
            clearTimeout(subscription)
            return result_set
        }
        return await this.run_ptc(query)
    }
}

module.exports = { 'PTCClient': PTCClient }