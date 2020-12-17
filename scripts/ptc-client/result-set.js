class ResultSet {

    constructor() {
        this._solutions = []
        this._memory = {}
    }

    append(solution) {
        let imprint = solution['?imprint']
        if (!(imprint in this._memory)) {
            this._memory[imprint] = true
            this._solutions.push(solution)
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
}

module.exports = { 'ResultSet': ResultSet }