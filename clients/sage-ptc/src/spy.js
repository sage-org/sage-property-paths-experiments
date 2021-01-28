class Spy {

    constructor () {
        this._nb_http_calls = 0
        this._data_transfer = 0
        this._solutions_size = 0
        this._control_tuples_size = 0
        this._query_state = 'complete'
    }

    get nb_http_calls() {
        return this._nb_http_calls
    }

    get data_transfer() {
        return this._data_transfer
    }

    get solutions_size() {
        return this._solutions_size
    }

    get control_tuples_size() {
        return this._control_tuples_size
    }

    get query_state() {
        return this._query_state
    }

    report_nb_http_calls(count = 1) {
        this._nb_http_calls += count
    }

    report_data_transfer(bytes) {
        this._data_transfer += bytes
    }

    report_solutions_size(bytes) {
        this._solutions_size += bytes
    }

    report_control_tuples_size(bytes) {
        this._control_tuples_size += bytes
    }

    report_query_state(state) {
        if (this._queryState !== 'error') {
            this._queryState = state
        }
    }
}

module.exports = { Spy }