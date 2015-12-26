'use strict'
var Duplex = require('stream').Duplex

/**
Similar to `.pipe` except `.pipe` returns the last stream in a pipeline. stream-connect returns a stream which writes to the first stream in the pipeline and reads from the last.

Consider this `.pipe` example.
```js
function getExampleStream () {
  ...
  return streamOne.pipe(streamTwo)
}

const stream = getExampleStream()
stream.on('data', function (chunk) {}) // catches data from streamOne via streamTwo
stream.on('error', function (err) {}) // catches errors only from streamTwo
stream.end('test') // is written to streamTwo
```

If you write to the output it will be written to `streamTwo`, whereas you probably wanted to write to the start of the pipeline and read from the end. Fixed by stream-connect:

```js
const connect = require('stream-connect')

function getExampleStream () {
  ...
  return connect(streamOne, streamTwo)
}

const stream = getExampleStream()
stream.on('data', function (chunk) {}) // catches data from streamOne via streamTwo
stream.on('error', function (err) {}) // catches errors from both streamOne and streamTwo
stream.end('test') // is written to streamOne
```

Any errors emitted in `streamOne` or `streamTwo` are propagated to the output stream.

@module stream-connect
@example
const connect = require('stream-connect')

function streamsOneAndTwo () {
  const streamOne = getStreamOneSomehow()
  const streamTwo = getStreamTwoSomehow()

  // We want to return streams one and two pre-connected. We can't return
  // `streamOne.pipe(streamTwo)` as this returns streamTwo while the calling code
  // wants to write to streamOne yet receive the output from streamTwo.
  // So, return a new stream which is streams one and two connected:
  const streamsOneAndTwo = connect(streamOne(), streamTwo())
}

// main.js is piped through the pre-connected streamOne and streamTwo, then stdout
fs.createReadStream('main.js')
  .pipe(streamsOneAndTwo())
  .pipe(process.stdout)
*/
module.exports = connect

/**
Connects two streams together.

@param {external:Duplex} - source stream
@param {external:Duplex} - dest stream, to be connected to
@return {external:Duplex}
@alias module:stream-connect
*/
function connect (one, two) {
  one.pipe(two)

  var connected = new Duplex({ objectMode: true })
  connected._write = function (chunk, enc, done) {
    one.write(chunk)
    done()
  }
  connected._read = function () {}
  connected
    .on('finish', function () {
      one.end()
    })
    .on('pipe', function (src) {
      one.emit('pipe', src)
    })

  /* use flowing rather than paused mode, for node 0.10 compatibility. */
  two
    .on('data', function (chunk) {
      connected.push(chunk)
    })
    .on('end', function () {
      connected.push(null)
    })
    .on('error', function (err) {
      connected.emit('error', err)
    })

  one.on('error', function (err) {
    connected.emit('error', err)
  })


  return connected
}

/**
@external Duplex
@see https://nodejs.org/api/stream.html#stream_class_stream_duplex
*/
