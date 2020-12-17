const HttpClient = require('./http-client').HttpClient
const ResultSet = require('./result-set').ResultSet
const { execute } = require('./engine')

class PTCClient {

    constructor(server_url, default_graph_iri, spy) {
        this._server_url = server_url
        this._default_graph_iri = default_graph_iri
        this._spy = spy
        this._http = new HttpClient(server_url, spy)
    }

    async execute(query, timeout) {
        let http = this._http
        http.open()
        if (timeout) {
            let subscription = setTimeout(function() {
                http.close()
            }, timeout * 1000)
            let result_set = await query.run(this._http, this._default_graph_iri)
            clearTimeout(subscription)
            return result_set
        }
        return await query.run(this._http, this._default_graph_iri)
    }

    async execute_one_call(query, timeout) {
        let result_set = new ResultSet()
        let http = this._http
        http.open()
        let result = null
        if (timeout) {
            let subscription = setTimeout(function() {
                result_set.complete = false
                http.close()
            }, timeout * 1000)
            result = await execute(query, this._http, this._default_graph_iri)
            clearTimeout(subscription)
        } else {
            result = await execute(query, this._http, this._default_graph_iri)
        }
        let [bindings, stars_information] = result 
        result_set.append_all(bindings)
        for (let row of stars_information) {
            if (row.depth === row.max_depth) {
                result_set.complete = false
                break
            }
        }
        return result_set
    }
}

module.exports = { 'PTCClient': PTCClient }