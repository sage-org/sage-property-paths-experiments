/* file : sage-graph.ts
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

const Graph = require('./../../sage-multi-engine/dist/api').Graph
const Pipeline = require('./../../sage-multi-engine/dist/api').Pipeline

const SageRequestClient = require('./sage-http-client').SageRequestClient

const SageBGPOperator = require('./sage-operators').SageBGPOperator
const SageManyBGPOperator = require('./sage-operators').SageManyBGPOperator
const SageQueryOperator = require('./sage-operators').SageQueryOperator

/**
 * A SageGraph implements the Graph abstract class,
 * so it can be used to execute SPARQL queries
 * at a SaGe server using the sparl-engine framework.
 * @author Thomas Minier
 */
class SageGraph extends Graph {

  constructor (url, defaultGraph, spy) {
    super()
    this._url = url
    this._defaultGraph = defaultGraph
    this._spy = spy
    this._httpClient = new SageRequestClient(this._url, this._spy)
  }

  find (triple, context) {
    const input = this.evalBGP([triple], context)
    return Pipeline.getInstance().map(input, bindings => {
      return bindings.bound(triple)
    })
  }

  evalBGP (bgp, context) {
    return SageBGPOperator(bgp, this._defaultGraph, this._httpClient)
  }

  evalUnion (patterns, options) {
    return SageManyBGPOperator(patterns, this._defaultGraph, this._httpClient)
  }

  evalQuery (query, context) {
    return SageQueryOperator(query, this._defaultGraph, this._httpClient)
  }

  open () {
    this._httpClient.open()
  }

  close () {
    this._httpClient.close()
  }
}

module.exports = { SageGraph }