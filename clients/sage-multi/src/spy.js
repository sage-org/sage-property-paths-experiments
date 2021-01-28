/* file : spy.ts
MIT License

Copyright (c) 2018-2020 Thomas Minier

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/

'use strict'

/**
 * A Spy inspect SPARQL query execution to provide metadata after query evaluation
 * @author Thomas Minier
 */
class Spy {

  constructor () {
    this._nb_http_calls = 0
    this._data_transfer = 0
    this._overheads = []
    this._query_state = 'complete'
  }

  get nb_http_calls() {
    return this._nb_http_calls
}

  get data_transfer() {
      return this._data_transfer
  }

  get avg_overhead () {
    return this._overheads.reduce((x, y) => x + y, 0) / this._overheads.length
  }

  get query_state() {
    return this._query_state
  }

  report_overhead (overhead) {
    this._overheads.push(overhead)
  }

  report_nb_http_calls(count = 1) {
    this._nb_http_calls += count
  }

  report_data_transfer(bytes) {
      this._data_transfer += bytes
  }

  report_query_state(state) {
    if (this._queryState !== 'error') {
        this._queryState = state
    }
  }
}

module.exports = { Spy }