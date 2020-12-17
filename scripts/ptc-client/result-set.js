class ResultSet {

    constructor() {
        this._solutions = []
        this._memory = {}
        this._duplicates = 0
        this._bgp = 1
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

    solutions() {
        return this._solutions
    }

    duplicates() {
        return this._duplicates
    }

    set bgp(id) {
        this._bgp = id
    }

    get bgp() {
        return this._bgp
    }
}

module.exports = { 'ResultSet': ResultSet }