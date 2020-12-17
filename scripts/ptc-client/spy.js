class Spy {

    constructor () {
        this._nbHttpCalls = 0
        this._transferSize = 0
        this._bindingsDataTransfer = 0
        this._starsInformationDataTransfer = 0
        this._queryState = 'complete'
    }

    get nbHTTPCalls() {
        return this._nbHttpCalls
    }

    get transferSize() {
        return this._transferSize
    }

    get bindingsDataTransfer() {
        return this._bindingsDataTransfer
    }

    get starsInformationDataTransfer() {
        return this._starsInformationDataTransfer
    }

    get queryState() {
        return this._queryState
    }

    reportHTTPRequest(count = 1) {
        this._nbHttpCalls += count
    }

    reportHTTPTransferSize(bytes) {
        this._transferSize += bytes
    }

    reportBindingsDataTransfer(bytes) {
        this._bindingsDataTransfer += bytes
    }

    reportStarsInformationDataTransfer(bytes) {
        this._starsInformationDataTransfer += bytes
    }

    reportQueryState(state) {
        if (this._queryState !== 'error') {
            this._queryState = state
        }
    }
}

module.exports = { 'Spy': Spy }