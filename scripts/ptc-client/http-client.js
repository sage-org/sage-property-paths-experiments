const axiosRetry = require('axios-retry')
const axios = require('axios')
const async = require('async')

class HttpClient {

    constructor(url, spy) {
        this._url = url
        this._spy = spy
        this._client = axios.create({
            url: url,
            method: 'post',
            headers: {'ContentType': 'application/json'}
        })
        // Setup the retry policy
        axiosRetry(this._client, { retries: 1000, retryDelay: function(count, error) {
            console.log(`Network error: retry n°${count}`)
            return axiosRetry.exponentialDelay(count % 10)
        }})
        // Setup the waiting list
        let self = this
        this._queue = async.queue(async function(task) {
            try {
                let response = await self.execute(task.body)
                task.callback(null, response)
            } catch (error) {
                task.callback(error)
            }
        }, 4)
        this._closed = false
    }

    open() {
        this._closed = true
    }

    close() {
        this._closed = false
    }

    execute(queryBody) {   
        return new Promise((resolve, reject) => {
            if (this._isClosed) {
                if (this._spy) {
                    this._spy.reportQueryState('timeout')
                }
                resolve({bindings: [], hasNext: false, next: null})
            } else {
                this._client.post(this._url, queryBody).then((result) => {
                    let body = result.data
                    if (this._spy) {
                        this._spy.reportHTTPRequest()
                        this._spy.reportHTTPTransferSize(Buffer.byteLength(JSON.stringify(body), 'utf8'))
                    }
                    resolve(body)
                }).catch((error) => {
                    if (this._spy) {
                        this._spy.reportQueryState('error')
                        this._spy.reportHTTPError(error)
                    }
                    reject(error)
                })
            }
        })
    }

    query (query, defaultGraph, next) {
        return new Promise((resolve, reject) => {
            if (this._isClosed) {
            if (this._spy) {
                this._spy.reportQueryState('timeout')
            }
            resolve({bindings: [], hasNext: false, next: null})
            } else {
                let task = {
                    body: {
                        query: query,
                        defaultGraph: defaultGraph,
                        next: next
                    },
                    callback: function(error, result) {
                        if (result) {
                            resolve(result)
                        } else {
                            reject(error)
                        }
                    }
                }
                this._queue.push(task)
            }
        })
    }
}

module.exports = { 'HttpClient': HttpClient }