class ResultSet {

    constructor() {
        this._solutions = []
        this._memory = {}
        this._duplicates = 0
        this._bgp = 1
        this._complete = true
    }

    append(solution) {
        let imprint = solution['?imprint']
        if (!(this._bgp in this._memory)) {
            this._memory[this._bgp] = {}
        }
        if (!(imprint in this._memory[this._bgp])) {
            this._memory[this._bgp][imprint] = true
            this._solutions.push(solution)
        } else {
            this._duplicates++
        }
    }

    append_all(solutions) {
        for (let solution of solutions) {
            this.append(solution)
        }
    }

    get solutions() {
        return this._solutions
    }

    get nb_solutions() {
        return this._solutions.length
    }

    get nb_duplicates() {
        return this._duplicates
    }

    set bgp(id) {
        this._bgp = id
    }

    get bgp() {
        return this._bgp
    }

    set complete(value) {
        this._complete = value
    }

    get complete() {
        return this._complete
    }
}

module.exports = { 'ResultSet': ResultSet }