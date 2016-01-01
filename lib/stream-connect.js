'use strict'
var Duplex = require('stream').Duplex
var arrayify = require('array-back')
var assert = require('assert')

/**
 * Similar to `.pipe` except `.pipe` returns the last stream in a pipeline. stream-connect returns a stream which writes to the first stream in the pipeline and reads from the last.
 *
 * Consider this `.pipe` example.
 * ```js
 * function getExampleStream () {
 *   ...
 *   return streamOne.pipe(streamTwo)
 * }
 *
 * const stream = getExampleStream()
 * stream.on('data', function (chunk) {}) // catches data from streamOne via streamTwo
 * stream.on('error', function (err) {}) // catches errors only from streamTwo
 * stream.end('test') // is written to streamTwo
 * ```
 *
 * If you write to the output it will be written to `streamTwo`, whereas you probably wanted to write to the  * start of the pipeline and read from the end. Fixed by stream-connect:
 *
 * ```js
 * const connect = require('stream-connect')
 *
 * function getExampleStream () {
 *   ...
 *   return connect(streamOne, streamTwo)
 * }
 *
 * const stream = getExampleStream()
 * stream.on('data', function (chunk) {}) // catches data from streamOne via streamTwo
 * stream.on('error', function (err) {}) // catches errors from both streamOne and streamTwo
 * stream.end('test') // is written to streamOne
 * ```
 *
 * Any errors emitted in `streamOne` or `streamTwo` are propagated to the output stream.
 *
 * @module stream-connect
 */
module.exports = connect

/**
 * Connect streams.
 *
 * @param {...external:Duplex} - One or more streams to connect.
 * @return {external:Duplex}
 * @alias module:stream-connect
 */
function connect () {
  var streams = arrayify(arguments)
  assert.ok(streams.length >= 2, 'Must supply at least two input stream.')

  var first = streams[0]
  var last = streams[streams.length - 1]

  streams.reduce(function (prev, curr) {
    prev.pipe(curr)
    return curr
  })

  var connected = new Duplex({ objectMode: true })
  connected._write = function (chunk, enc, done) {
    first.write(chunk)
    done()
  }
  connected._read = function () {}
  connected
    .on('finish', function () {
      first.end()
    })
    .on('pipe', function (src) {
      first.emit('pipe', src)
    })

  /* use flowing rather than paused mode, for node 0.10 compatibility. */
  last
    .on('data', function (chunk) {
      connected.push(chunk)
    })
    .on('end', function () {
      connected.push(null)
    })
    .on('error', function (err) {
      connected.emit('error', err)
    })

  first.on('error', function (err) {
    connected.emit('error', err)
  })

  return connected
}

/**
 * @external Duplex
 * @see https://nodejs.org/api/stream.html#stream_class_stream_duplex
 */
