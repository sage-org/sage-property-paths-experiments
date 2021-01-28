const HttpClient = require('./http-client').HttpClient
const ResultSet = require('./result-set').ResultSet
const { execute, eval, is_complete } = require('./engine')

class PTCClient {

    constructor(server_url, default_graph_iri, spy) {
        this._server_url = server_url
        this._default_graph_iri = default_graph_iri
        this._spy = spy
        this._http = new HttpClient(server_url, spy)
    }

    async eval_query(query) {
        let result_set = new ResultSet()
        for (let [number, subquery] of query.subqueries.entries()) {
            result_set.bgp = number
            await eval(subquery, this._http, this._default_graph_iri, result_set)
        }
        return result_set
    }

    async eval_query_without_expanding_frontier_nodes(query) {
        let result_set = new ResultSet()
        for (let [number, subquery] of query.subqueries.entries()) {
            result_set.bgp = number
            let [solutions, control_tuples] = await execute(subquery, this._http, this._default_graph_iri)
            result_set.append_all(solutions)
            result_set.complete = is_complete(control_tuples)
        }
        return result_set
    }

    async execute(query, timeout=0, expand_frontier_nodes=false) {
        let http_client = this._http
        let subscription = null
        let result_set = new ResultSet()
        http_client.open()
        if (timeout > 0) {
            subscription = setTimeout(() => http_client.close(), timeout * 1000)
        }
        if (expand_frontier_nodes) {
            result_set = await this.eval_query(query)
        } else {
            result_set = await this.eval_query_without_expanding_frontier_nodes(query)
        }
        if (timeout > 0) {
            clearTimeout(subscription)
        }
        return result_set
    }
}

module.exports = { PTCClient }